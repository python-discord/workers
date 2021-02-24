# 👷 Hastebin Redirector

This Cloudflare Worker redirects requests to Python highlighted syntax on the PyDis hastebin.

The code for the worker can be found in `index.js`.

## Publishing

You need to install `wrangler` with `npm install -g @cloudflare/wrangler`.

Once you've installed this run `wrangler login`.

After you've authorised, you can make modifications to the worker and run `wrangler publish` to push them to the edge.
