# Short URLs

This worker handles short URls redirection on pydis.com (for example, https://pydis.com/admin).

URLs are stored in Workers KV and can be added in the Cloudflare Dashboard or through the Wrangler CLI.

## Publishing

You need to install `wrangler` with `npm install -g @cloudflare/wrangler`.

Once you've installed this run `wrangler login`.

After you've authorised, you can make modifications to the worker and run `wrangler publish` to push them to the edge.

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
