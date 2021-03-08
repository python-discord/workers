addEventListener('fetch', (event) => {
  // On request run our below logic.
  event.respondWith(handleRequest(event.request))
})

export async function handleRequest(request: Request): Promise<Response> {
  // Don't apply any logic to non-POSTs.
  if (request.method !== 'POST') {
    return new Response(
      'Worker lives! Ignoring this request because it is not a POST.',
    )
  }


  // Clone the request so that when we read JSON we can still forward it on later.
  let json = await request.clone().json();

  // Check if username is like "joe[bot]" or coveralls.
  let isCoveralls = json.sender?.login?.indexOf("coveralls") !== -1;
  let isGitHubBot = json.sender?.login?.indexOf('[bot]') !== -1;
  let isDependabotBranchDelete = json.ref?.indexOf("dependabot") !== -1 && request.headers.get("X-GitHub-Event") === "delete";
  let isBotPRApprove = json.pull_request?.user?.login?.indexOf("[bot]") !== -1 && request.headers.get("X-GitHub-Event") === "pull_request_review";

  let isEmptyReview = json.review?.state === "commented" && request.headers.get("X-GitHub-Event") === "pull_request_review";

  // Combine logic.
  let botPayload = isCoveralls || isGitHubBot || isDependabotBranchDelete || isBotPRApprove;
  let noisyUserActions = isEmptyReview;

  let shouldIgnore = botPayload || noisyUserActions;

  // If payload is not from a bot.
  if (!shouldIgnore) {
    // Create a new URL object to break out the
    let url = new URL(request.url)

    // Check for invalid config.
    if (url.pathname === '/') {
      return new Response(
        'Make sure to specify webhook components like /:id/:token',
      )
    }

    let [, id, token] = url.pathname.split('/')

    // Format for a webhook
    let template = `https://discord.com/api/webhooks/${id}/${token}/github`;

    // Pass on data to Discord as usual
    return await fetch(template, request)
  }

  // Ignore any bot payload.
  return new Response(`Ignored by github-filter-worker`, {status: 203})
}
