import { Config, hc } from '@cloudflare/workers-honeycomb-logger'

const hcConfig: Config = {
  apiKey: HONEYCOMB_KEY,
  dataset: 'worker-url-unfurler',
  sampleRates: {
    '2xx': 20,
    '3xx': 20,
    '4xx': 5,
    '5xx': 1,
    exception: 1,
  },
}

const listener = hc(hcConfig, (event: Event) => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('fetch', listener)

/**
 * Try and get a URL from the request body.
 * Any error produced by this function are meant for the end user.
 *
 * @param request The POST request received in event.
 */
async function parseURL(request: Request): Promise<string> {
  // Try to read the body of the request
  let body
  try {
    body = JSON.parse(await request.text())
  } catch (error) {
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

  return url
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Ignoring non-POST request.')
  }

  let url
  try {
    url = await parseURL(request)
  } catch (error) {
    return new Response(error.message, { status: 400 })
  }

  request.tracer.addData({ url: url })

  let new_request
  try {
    new_request = await request.tracer.fetch(url)
  } catch (error) {
    if (error.message.startsWith('Fetch API cannot load')) {
      return new Response('Could not unfurl this URL.', { status: 400 })
    }
    throw error
  }

  return new Response(JSON.stringify({ destination: new_request.url }))
}
