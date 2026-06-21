# 👷 Error Pages

This worker serves HTML error pages from Cloudflare KV based on the request path. For example, a request to `/waf_block` will serve the HTML stored under the `waf_block.htm` key in KV.

## Deployment

From the repo root, run `npm install` to install dependencies.

Login with `npx wrangler login`, then deploy with:

```
npm run deploy -w error-pages
```

## Usage

Create or edit HTML files in `html_files/`.

Run the `./update_pages.sh` bash script on a system with NPM installed and wrangler logged in to push HTML files to the Cloudflare KV storage.

Changes should be live within a few seconds on `error-pages.pythondiscord.com`.
