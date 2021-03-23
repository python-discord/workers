import { Config, hc } from '@cloudflare/workers-honeycomb-logger';

const hcConfig: Config = {
  apiKey: HONEYCOMB_KEY,
  dataset: "worker-short-urls",
  sampleRates: {
    '2xx': 1,
    '3xx': 1,
    '4xx': 1,
    '5xx': 1,
    'exception': 1
  }
}

const listener = hc(hcConfig, event => {
  event.respondWith(handle(event.request));
})

addEventListener('fetch', listener)

async function handle(request: Request) {
  let path = new URL(request.url).pathname.slice(1);

  if (!path) {
    request.tracer.log("No path, forwarding to host.")
    return await request.tracer.fetch(request.url, request);
  }

  request.tracer.log("Fetching from KV")
  let redirect = await urls.get(path);

  request.tracer.addData({ path: path })

  if (redirect) {
    request.tracer.log(`Path found for ${path}, redirecting.`)
    return Response.redirect(redirect, 302);
  } else {
    request.tracer.log(`No path found, forwarding to origin.`)
    return await request.tracer.fetch(request.url, request);
  }
}
