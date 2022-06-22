addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const TOKEN_RE = new RegExp(/(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27,})/, "i")
const ERROR_MESSAGE = "We detected that you tried to upload a seemingly valid token. For security reasons, we blocked the upload. Please remove it and try again."

async function handleRequest(request) {
  const body = await request.text()

  if (TOKEN_RE.test(body)) {
    return new Response(JSON.stringify({message: ERROR_MESSAGE}), {status: 400})
  }

  const newRequest = {
    body: body,
    headers: request.headers,
    method: request.method
  }

  return await fetch("https://paste.pythondiscord.com/documents", newRequest)
}
