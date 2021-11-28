// A list of known file types to never try redirect.
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

// A regex for anything not ending in set of allowed exts
const ALLOWED_EXTS = /\/(?<code>[a-z]*)(\.(?!py|md|json|csv).*)?$/gm;

// A set of API route such as /raw/abc that should never be redirected.
const PATH_EXCLUDES = /\/(documents|raw)\/[a-z]+/

addEventListener('fetch', event => {
  // Call our handler on request.
  event.respondWith(handleRequest(event.request))
})

/**
 * Redirect certain requests to py extensions.
 * @param {Request} request
 */
async function handleRequest(request) {
  // Construct a URL from the request for easier parsing.
  let url = new URL(request.url);

  // Check if we have a non-Python extension.
  let match = ALLOWED_EXTS.exec(url.pathname);

  // Is the path one of our known API/raw endpoints?
  let path_exclude = PATH_EXCLUDES.exec(url.pathname);

  // Check we have no other matches and combine some logic.
  let has_regex_exclude = !match || path_exclude;
  let filename_exclude = EXCLUDE_LIST.indexOf(url.pathname) !== -1;

  // If any of these conditions match we should just forward to Hastebin.
  if (filename_exclude || request.method !== "GET" || has_regex_exclude || url.search === "?noredirect") {
    return await fetch(url, request);
  }

  // If we get here we should redirect to the Python highlighted version of the document.
  return Response.redirect(`${url.origin}/${match.groups.code}.py`, 301)
}
