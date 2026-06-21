# 👷 Serve Robots

This worker servers `robots.txt` files at any domain proxied through Cloudflare with a matching file in the `robots-files` folder. Matching is performed on the hostname.

## Deployment

From the repo root, run `npm install` to install dependencies.

Login with `npx wrangler login`, then deploy with:

```
npm run deploy -w serve-robots
```

## Usage

Create files in `robots-files` with the hostname of the desired service. Ensure they are proxied through Cloudflare.

Run the `./update_robots.sh` bash script on a system with NPM installed and wrangler logged in to push new robots.txt files to the Cloudflare KV storage.

Changes should be live within a few seconds at `/robots.txt` on your provisioned domain.
