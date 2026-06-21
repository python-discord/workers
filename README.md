# 👷 Workers
Cloudflare Workers in use at Python Discord.

All workers are licensed under MIT.

## Structure

This is a monorepo managed with npm workspaces. Each worker lives in its own subdirectory with its own `wrangler.toml`. Dependencies are installed from the root.

To deploy a specific worker:

```
npm run deploy:<worker>
```

## Workers

| Directory | Description |
| --- | --- |
| [error-pages](error-pages/) | Serves HTML error pages from KV |
| [report-uri](report-uri/) | Proxies CSP report URI requests |
| [serve-robots](serve-robots/) | Serves `robots.txt` files from KV |
| [short-urls](short-urls/) | Short URL redirects on pydis.com |
| [url-unfurler](url-unfurler/) | Follows redirect chains to their destination |

## Deployment

Workers are linted on pull requests and deployed to Cloudflare automatically on merge.
