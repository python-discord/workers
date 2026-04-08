# 👷 Error Pages

This worker serves HTML error pages from Cloudflare KV based on the request path. For example, a request to `/waf_block` will serve the HTML stored under the `waf_block.htm` key in KV.

## Deployment

Install local dependencies with `npm install`.

Login to wrangler with `npx wrangler login`.

After you've authorised, you can make modifications to the worker and run `npm run deploy` to deploy.

## Usage

Create or edit HTML files in `html_files/`.

Run the `./update_pages.sh` bash script on a system with NPM installed and wrangler logged in to push HTML files to the Cloudflare KV storage.

Changes should be live within a few seconds on `error-pages.pythondiscord.com`.
