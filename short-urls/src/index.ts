addEventListener('fetch', (event) => {
  event.respondWith(handle(event));
})

async function handle(event: FetchEvent) {
  let path = new URL(event.request.url).pathname.slice(1);

  if (!path) {
    return await fetch(event.request.url, event.request);
  }

  let redirect = await urls.get(path);

  if (redirect) {
    return Response.redirect(redirect, 302);
  } else {
    return await fetch(event.request.url, event.request);
  }
}
