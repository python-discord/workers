import { Config, hc } from '@cloudflare/workers-honeycomb-logger';

const hcConfig: Config = {
  apiKey: HONEYCOMB_KEY,
  dataset: "worker-discord-github-filter",
  sampleRates: {
    '2xx': 1,
    '3xx': 1,
    '4xx': 1,
    '5xx': 1,
    'exception': 1
  }
}
const emojiRegex = /:([a-zA-Z0-9-_])+?:/g

const listener = hc(hcConfig, event => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('fetch', listener)

// Try to lookup the emoji through the KV namespace, return the name if not found
async function lookupEmoji(name: string): Promise<string> {
  let value = await EMOJIS.get(name)
  return value ? value : `:${name}:`
}

export async function handleRequest(request: Request): Promise<Response> {
  // Don't apply any logic to non-POSTs.
  if (request.method !== 'POST') {
    return new Response(
      'Worker lives! Ignoring this request because it is not a POST.',
    )
  }


  // Clone the request so that when we read JSON we can still forward it on later.
  let json = await request.clone().json();

  request.tracer.addData({
    githubEvent: request.headers.get("X-GitHub-Event"),
    sender: json.sender?.login
  })

  // Check if username is like "joe[bot]" or coveralls.
  let isCoveralls = json.sender?.login?.indexOf("coveralls") !== -1;
  let isGitHubBot = json.sender?.login?.indexOf('[bot]') !== -1;
  let isDependabotBranchDelete = json.ref?.indexOf("dependabot") !== -1 && request.headers.get("X-GitHub-Event") === "delete";
  let isBotPRApprove = json.pull_request?.user?.login?.indexOf("[bot]") !== -1 && request.headers.get("X-GitHub-Event") === "pull_request_review";

  let isEmptyReview = (
    json.review?.state === "commented" &&
    request.headers.get("X-GitHub-Event") === "pull_request_review" &&
    json.review?.body === null
  );

  // Combine logic.
  let botPayload = isCoveralls || isGitHubBot || isDependabotBranchDelete || isBotPRApprove;
  let noisyUserActions = isEmptyReview;

  let shouldIgnore = botPayload || noisyUserActions;

  request.tracer.addData({ botPayload, noisyUserActions, shouldIgnore });

  // If payload is not from a bot.
  if (!shouldIgnore) {
    // Create a new URL object to break out the
    let url = new URL(request.url)

    // Check for invalid config.
    if (url.pathname === '/') {
      return new Response(
        'Make sure to specify webhook components like /:id/:token',
        { status: 400 }
      )
    }

    let [, id, token] = url.pathname.split('/')

    // Format for a webhook
    let template = `https://discord.com/api/webhooks/${id}/${token}/github`;

    // Translate emojis to the in-server emoji
    let promises: any[] = [];
    (await request.text()).match(emojiRegex)?.forEach (
        (match) => {promises.push(lookupEmoji(match))}
        )
    let emojis: string[] = await Promise.all(promises)

    let new_request = new Request(template, {
      body: (await request.text()).replace(
          emojiRegex,
          () => {return emojis.shift()}
      ),
      headers: request.headers,
      method: request.method
    })

    // Pass on data to Discord as usual
    return await fetch(template, new_request)
  }

  // Ignore any bot payload.
  return new Response(`Ignored by github-filter-worker`, {status: 203})
}
