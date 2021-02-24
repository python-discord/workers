const EXCLUDE_LIST = [
  "/application.min.js",
  "/highlight.min.js",
  "/application.js",
  "/application.css",
  "/solarized_dark.css",
  "/highlight.js",
  "/favicon.ico",
  "/about.md",
  "/logo.png",
  "/"
];

const NON_PY_EXT = /\/(?<code>[a-z]*)(\.(?!py).*)?$/gm;

const PATH_EXCLUDES = /\/(documents|raw)\/[a-z]+/

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Redirect certain requests to py extensions.
 * @param {Request} request
 */
async function handleRequest(request) {
  let url = new URL(request.url);

  let match = NON_PY_EXT.exec(url.pathname);

  let path_exclude = PATH_EXCLUDES.exec(url.pathname);

  let has_regex_exclude = !match || path_exclude;
  let filename_exclude = EXCLUDE_LIST.indexOf(url.pathname) !== -1;

  if (filename_exclude || request.method !== "GET" || has_regex_exclude || url.search === "?noredirect") {
    return await fetch(url, request);
  }

  return Response.redirect(`${url.origin}/${match.groups.code}.py`, 307)
}
