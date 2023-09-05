import { Config, wrapModule } from "@cloudflare/workers-honeycomb-logger";

const hcConfig: Config = {
  dataset: "worker-short-urls",
  sampleRates: {
    "1xx": 1,
    "2xx": 1,
    "3xx": 1,
    "4xx": 1,
    "5xx": 1,
    exception: 1,
  },
};

interface Env {
  urls: KVNamespace;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    let path = new URL(request.url).pathname.slice(1).replace(/\//, "");

    if (!path) {
      request.tracer.log("No path, forwarding to host.");
      return await request.tracer.fetch(request.url, request);
    }

    request.tracer.log("Fetching from KV");
    let redirect = await env.urls.get(path);

    request.tracer.addData({ path: path });

    if (redirect) {
      request.tracer.log(`Path found for ${path}, redirecting.`);
      return Response.redirect(redirect, 302);
    } else {
      request.tracer.log(`No path found, forwarding to origin.`);
      return await request.tracer.fetch(request.url, request);
    }
  },
};

export default wrapModule(hcConfig, worker);
