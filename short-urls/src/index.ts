addEventListener('fetch', (event) => {
  event.respondWith(handle(event));
})

async function handle(event: FetchEvent) {
  let url = new URL(event.request.url);

  let redirect = await urls.get(url.pathname.slice(1));

  if (redirect) {
    return Response.redirect(redirect, 302);
  } else {
    return await fetch(event.request.url, event.request);
  }
}
