# obrero

Python Discord's trusty unpaid employee.

All workers are licensed under the AGPLv3.

## Structure

The `obrero` package contains the implementation. The following workers are provided:

- `ReportURI`, which anonymizes and proxies CSP requests to the state.
- `ServeRobots`, which serves `robots.txt` files as applicable

## Workers

| Directory | Description |
| --- | --- |
| [error-pages](error-pages/) | Serves HTML error pages from KV |
| [short-urls](short-urls/) | Short URL redirects on pydis.com |
| [url-unfurler](url-unfurler/) | Follows redirect chains to their destination |

## Deployment

`obrero`, when provided with a sixpack of Desparados and the prospect of an
unpaid vacation day, is moved to Python Discord's Debian server via Ansible.
