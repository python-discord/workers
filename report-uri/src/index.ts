import type { Request as WorkerRequest, ExecutionContext as WorkerExecutionContext, RequestInit } from "@cloudflare/workers-types"

export default {
  async fetch(req: WorkerRequest, _env: unknown, _ctx: WorkerExecutionContext) {
    let path = new URL(req.url).pathname
    let address = 'https://pythondiscord.report-uri.com' + path

    let response = await fetch(address, req);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText
    })
  }
}
