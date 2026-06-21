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

| Directory                 | Description                      |
| ------------------------- | -------------------------------- |
| [short-urls](short-urls/) | Short URL redirects on pydis.com |
| [webfinger](webfinger/)   | WebFinger endpoint for pydis.wtf |

## Deployment

Workers are linted on pull requests and deployed to Cloudflare automatically on merge.
