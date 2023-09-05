# 👷 Report URI

This worker proxies CSP and other report URI requests over Cloudflare Workers to anonymise the origin.

## Deployment

Install local dependencies with `npm install`.

Login to wrangler with `npx wrangler login`.

After you've authorised, you can make modifications to the worker and run `npm run deploy` to deploy.

## Usage

Once the worker is activated it will respond to requests at `csp.pythondiscord.com`.
