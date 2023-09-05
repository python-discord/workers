import { Config, wrapModule } from '@cloudflare/workers-honeycomb-logger'

const DEFAULT_MAX_REDIRECTS = 6

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

const hcConfig: Config = {
  dataset: 'worker-url-unfurler',
  sampleRates: {
    '1xx': 1,
    '2xx': 20,
    '3xx': 20,
    '4xx': 5,
    '5xx': 1,
    exception: 1,
  },
}

/**
 * Try and get input from the request body.
 * Any errors produced by this function are meant for the end user.
 *
 * @param request The POST request received in event.
 * @return [string, number] An array of the URL and depth limit.
 */
async function parseInput(request: Request): Promise<[string, number]> {
  // Try to read the body of the request
  let body
  try {
    body = JSON.parse(await request.text())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(`Could not parse body, error: ${error.message}`)
  }

  // Validate input
  let url = body['url']
  if (url === undefined) {
    throw new Error('Invalid input, `url` key not found in body.')
  }

  if (!(url.startsWith('http://') || url.startsWith('https://'))) {
    url = 'https://' + url
  }

  let max_depth = body['max-depth']
  if (max_depth === undefined) {
    max_depth = DEFAULT_MAX_REDIRECTS
  }

  const _max_depth = Number.parseInt(max_depth)
  if (isNaN(_max_depth)) {
    throw new Error(
      `Invalid input \`max-depth: ${max_depth}\` could not be parsed as a number.`,
    )
  }

  return [url, _max_depth]
}

/**
 * Unfurl a URL, as far as necessary.
 *
 * @param tracer The HoneyComb tracer from the request.
 * @param url The URL to unfurl.
 * @param max_depth How far to go before giving up.
 */
async function unfurl(
  { tracer }: Request,
  url: string,
  max_depth: number,
): Promise<[number, string?, Response?]> {
  let previous = undefined
  let next = url
  let new_request

  let depth = 0
  let location

  while (previous !== next) {
    // Get the next request in the chain
    try {
      new_request = await tracer.fetch(next, { redirect: 'manual' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.message.startsWith('Fetch API cannot load')) {
        return [
          depth,
          undefined,
          new Response(JSON.stringify({ error: 'Fetch request failed.' }), {
            status: 400,
            headers: JSON_HEADERS,
          }),
        ]
      } else if (e.message.startsWith('Too many subrequests')) {
        tracer.log('Hit max depth allowed without resolving.')
        tracer.addData({
          final_url: previous,
          next_url: next,
          depth: depth + 1,
        })

        return [
          depth,
          undefined,
          new Response(
            JSON.stringify({
              error:
                'Reached the max depth allowable for subrequests without resolving.',
              depth: depth,
              final: previous,
              next: next,
            }),
            { status: 416, headers: JSON_HEADERS },
          ),
        ]
      }

      throw e
    }

    if (![301, 302, 307, 308].includes(new_request.status)) {
      // We've reached the bottom
      break
    }

    location = new_request.headers.get('location')
    if (location === undefined || location === null) {
      // No clear way to proceed, exit early
      tracer.log('Received a redirect without a location header.')
      return [
        depth,
        undefined,
        new Response(
          JSON.stringify({
            error:
              'Reached an uncertain conclusion, since no location header was set.',
            depth: depth,
            final: previous ? previous : url,
          }),
          { status: 418, headers: JSON_HEADERS },
        ),
      ]
    }

    if (!(location.startsWith('http://') || location.startsWith('https://'))) {
      // Relative redirect
      const { protocol, hostname } = new URL(next)
      location = protocol + '//' + hostname + location
    }

    previous = next
    next = location
    depth++

    if (depth > max_depth) {
      return [
        depth,
        undefined,
        new Response(
          JSON.stringify({
            error: 'Reached the max depth defined without resolving.',
            depth: depth - 1,
            final: previous,
            next: next,
          }),
          { status: 416, headers: JSON_HEADERS },
        ),
      ]
    }
  }

  return [depth, next, undefined]
}

const worker = {
  async fetch(request: Request, _env: unknown, _ctx: ExecutionContext) {
    if (request.method !== 'POST') {
      return new Response('Ignoring non-POST request.')
    }

    let url, max_depth
    try {
      ;[url, max_depth] = await parseInput(request)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }

    request.tracer.addData({ original_url: url, max_depth: max_depth })

    const [depth, new_url, response] = await unfurl(request, url, max_depth)
    if (response !== undefined) {
      return response
    }

    request.tracer.addData({ destination_url: new_url, actual_depth: depth })
    return new Response(
      JSON.stringify({ destination: new_url, depth: depth }),
      {
        headers: JSON_HEADERS,
      },
    )
  },
}

export default wrapModule(hcConfig, worker)
