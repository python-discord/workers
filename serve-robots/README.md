# 👷 Serve Robots

This worker servers `robots.txt` files at any domain proxied through Cloudflare with a matching file in the `robots-files` folder. Matching is performed on the hostname.

## Deployment

Install local dependencies with `npm install`.

Login to wrangler with `npx wrangler login`.

After you've authorised, you can make modifications to the worker and run `npm run deploy` to deploy.

## Usage

Create files in `robots-files` with the hostname of the desired service. Ensure they are proxied through Cloudflare.

Run the `./update_robots.sh` bash script on a system with NPM installed and wrangler logged in to push new robots.txt files to the Cloudflare KV storage.

Changes should be live within a few seconds at `/robots.txt` on your provisioned domain.
