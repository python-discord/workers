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

function parseURL(url: string): string {
  const index = url.indexOf('/')
  if (index === -1) {
    throw Error('InputError')
  }

  let new_url = url.substr(index + 1)

  if (new_url.startsWith('http:/') || new_url.startsWith('https:/')) {
    new_url = new_url.replace(':/', '://')
  } else {
    new_url = 'https://' + new_url
  }

  return new_url
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Ignoring non-POST request.')
  }

  // Create a new URL object to break out the
  const url = new URL(request.url)
  let new_url

  try {
    // Check for invalid config.
    if (url.pathname === '/') {
      throw Error('InputError')
    }

    new_url = parseURL(url.pathname)
  } catch (error) {
    if (error.message === 'InputError') {
      return new Response('Make sure to specify the url to unfurl like /:url', {
        status: 400,
      })
    }

    throw error
  }

  request.tracer.addData({ url: new_url })

  let new_request
  try {
    new_request = await request.tracer.fetch(new_url)
  } catch (error) {
    if (error.message.startsWith('Fetch API cannot load')) {
      return new Response('Could not unfurl this URL.', { status: 400 })
    }

    throw error
  }

  return new Response(JSON.stringify({ destination: new_request.url }))
}
