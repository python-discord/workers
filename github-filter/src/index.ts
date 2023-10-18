import { Config, wrapModule } from "@cloudflare/workers-honeycomb-logger";
import type { ExecutionContext } from "@cloudflare/workers-types";

const hcConfig: Config = {
  dataset: "worker-discord-github-filter",
  sampleRates: {
    "1xx": 1,
    "2xx": 1,
    "3xx": 1,
    "4xx": 1,
    "5xx": 1,
    exception: 1,
  },
};

interface Env {
  LABELS: KVNamespace;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Don't apply any logic to non-POSTs.
    if (request.method !== "POST") {
      return new Response("Worker lives! Ignoring this request because it is not a POST.");
    }

    // Clone the request so that when we read JSON we can still forward it on later.
    let json: Record<string, any> = await request.clone().json();

    request.tracer.addData({
      githubEvent: request.headers.get("X-GitHub-Event"),
      sender: json.sender?.login,
    });

    // Check if username is like "joe[bot]" or coveralls.
    let isCoveralls = json.sender?.login?.indexOf("coveralls") !== -1;
    let isGitHubBot = json.sender?.login?.indexOf("[bot]") !== -1;
    let isSentry = json.sender?.login?.indexOf("sentry-io") !== -1;
    let isDependabotBranchDelete = json.ref?.indexOf("dependabot") !== -1 && request.headers.get("X-GitHub-Event") === "delete";
    let isBotPRApprove =
      json.pull_request?.user?.login?.indexOf("[bot]") !== -1 && request.headers.get("X-GitHub-Event") === "pull_request_review";

    let isEmptyReview =
      json.review?.state === "commented" && request.headers.get("X-GitHub-Event") === "pull_request_review" && json.review?.body === null;

    let isBlackNonMainPush =
      json.ref !== "refs/heads/main" &&
      json.repository?.name == "black" &&
      json.repository?.owner?.login == "psf" &&
      request.headers.get("X-GitHub-Event") === "push";

    // Combine logic.
    let botPayload = isCoveralls || (isGitHubBot && !isSentry) || isDependabotBranchDelete || isBotPRApprove;
    let noisyUserActions = isEmptyReview;

    let shouldIgnore = botPayload || noisyUserActions || isBlackNonMainPush;

    request.tracer.addData({ botPayload, noisyUserActions, shouldIgnore });

    // If payload is not from a bot.
    if (!shouldIgnore) {
      // Create a new URL object to break out the
      let url = new URL(request.url);

      // Check for invalid config.
      if (url.pathname === "/") {
        return new Response("Make sure to specify webhook components like /:id/:token", { status: 400 });
      }

      const data: Data = {
        body: await request.text(),
        headers: request.headers,
        method: request.method,
      };

      let [, id, token] = url.pathname.split("/");
      const resp = await sendWebhook(id, token, data);

      // Send data to any extra label webhooks
      let extraChannels = (json.issue || json.pull_request)?.labels?.map(async (label: { [key: string]: string }) => {
        let result = await sendLabelWebhook(label.name, data, env.LABELS);

        if (result) {
          return result;
        } else {
          request.tracer.log(`Sent extra webhook to ${label.name}'s channel.`);
        }
      });

      if (extraChannels && extraChannels.length) {
        // Look for any failed hooks.
        extraChannels = await Promise.all(extraChannels);
        const response = extraChannels.reduce((result: Response | void, item: Response | void) => result || item);

        if (response) return response;
      }

      return resp;
    }

    // Ignore any bot payload.
    return new Response(`Ignored by github-filter-worker`, { status: 203 });
  },
};

interface Data {
  body: string;
  headers: HeadersInit;
  method: string;
}

async function sendLabelWebhook(label: string, data: Data, labelNamespace: KVNamespace): Promise<Response | void> {
  let channel = await labelNamespace.get(label);

  if (channel) {
    let id, token;

    try {
      [id, token] = channel.split("/");
    } catch {
      return new Response(`Could not parse label webhook channel ${channel}. ` + `Make sure it's of the format /:id/:token.`, {
        status: 400,
      });
    }

    await sendWebhook(id, token, data);
  }
}

async function sendWebhook(id: string, token: string, data: Data) {
  // Format for a webhook
  let template = `https://discord.com/api/webhooks/${id}/${token}/github?wait=1`;

  let new_request = new Request(template, {
    body: data.body,
    headers: data.headers,
    method: data.method,
  });

  // Pass on data to Discord as usual
  const response = await fetch(template, new_request);
  if (!response.ok) {
    return new Response(response.json(), {
      status: response.status,
    });
  }
  return response;
}

export default wrapModule(hcConfig, worker);
