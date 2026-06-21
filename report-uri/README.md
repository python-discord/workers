# 👷 Report URI

This worker proxies CSP and other report URI requests over Cloudflare Workers to anonymise the origin.

## Deployment

From the repo root, run `npm install` to install dependencies.

Login with `npx wrangler login`, then deploy with:

```
npm run deploy -w report-uri
```

## Usage

Once the worker is activated it will respond to requests at `csp.pythondiscord.com`.
