# Short URLs

This worker handles short URls redirection on pydis.com (for example, https://pydis.com/admin).

URLs are stored in Workers KV and can be added in the Cloudflare Dashboard or through the Wrangler CLI.

## Deployment

From the repo root, run `npm install` to install dependencies.

Login with `npx wrangler login`, then deploy with:

```
npm run deploy -w short-urls
```

### Environment Variables

The following environment variables are required:

| Key                 | Description                            |
| ------------------- | -------------------------------------- |
| `HONEYCOMB_API_KEY` | API Key for Honeycomb tracing platform |

## Adding new URLs with wrangler

Change directory to the root of this worker and run:

```
$ npx wrangler kv:key put <key> <url> --binding urls
```
