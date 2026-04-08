interface Env {
  error_pages: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.replace(/^\//, "").replace(/\.htm(l)?$/, "");

    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const html = await env.error_pages.get(key + ".htm");
    console.log(`KV lookup: key="${key}.htm", found=${html !== null}`);
    if (html) {
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
