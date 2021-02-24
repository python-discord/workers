addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(
      'Worker lives! Ignoring this request because it is not a POST.',
    )
  }


  let json = await request.clone().json();

  let isCoveralls = json.sender?.login?.indexOf("coveralls") !== -1;
  let isGitHubBot = json.sender?.login?.indexOf('[bot]') !== -1;

  let botPayload = isCoveralls || isGitHubBot;

  if (!botPayload) {
    let url = new URL(request.url)

    if (url.pathname === '/') {
      return new Response(
        'Make sure to specify webhook components like /:id/:token',
      )
    }

    let [, id, token] = url.pathname.split('/')

    let template = `https://discord.com/api/webhooks/${id}/${token}/github`;

    return await fetch(template, request)
  }

  return new Response(`Ignored by github-filter-worker`)
}
