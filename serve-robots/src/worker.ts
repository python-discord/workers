interface Env {
  robots_files: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    let hostname = new URL(request.url).hostname;
    let robots;
    if ((robots = await env.robots_files.get(hostname))) {
      return new Response(robots, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } else {
      return await fetch(request.url, request);
    }
  },
};
