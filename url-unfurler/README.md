# 👷 URL Unfurler

This worker unfurls redirects to return the destination address. It will follow any number of redirects to reach the source.

This can be useful for finding out what's behind a shortened link, or any other deliberately hidden address.

## Deployment

You need to install `wrangler` with `npm install -g @cloudflare/wrangler`.

Once you've installed this run `wrangler login`.

After you've authorised, you can make modifications to the worker and run `wrangler publish` to push them to the edge.

## Usage

You can utilize this worker by making a GET request to `https://example.com/{redirect_url}`.

The worker will try to unfurl nested redirects as far as it can, but it may timeout before it reaches the end.
In those cases, you should be prepared to handle errors. The worker may also throw other errors on invalid input.

> Warning: This worker doesn't cache anything, and will blindly attempt to unfurl any url you give it.
> If ratelimits or speed are concerns, make sure you do caching elsewhere.
