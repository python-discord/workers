export default {
  async fetch(request: Request): Promise<Response> {
    const resource = new URL(request.url).searchParams.get("resource");
    const response = {
      subject: `${resource}`,
      links: [
        {
          rel: "http://openid.net/specs/connect/1.0/issuer",
          href: "https://id.pydis.wtf/realms/pydis",
        },
      ],
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
