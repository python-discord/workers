# 👷 URL Unfurler

This worker unfurls redirects to return the destination address. It will follow any number of redirects to reach the source.

This can be useful for finding out what's behind a shortened link, or any other deliberately hidden address.

## Deployment

Install dependencies with `npm install`.

Once you've installed this run `npx wrangler login`.

After you've authorised, you can make modifications to the worker and run `npm run deploy` to push them to the edge.

### Environment Variables

The following environment variables are required:

| Key                 | Description                            |
| ------------------- | -------------------------------------- |
| `HONEYCOMB_API_KEY` | API Key for Honeycomb tracing platform |

## Usage

You can utilize this worker by making a POST request to `https://example.com/`.
The JSON body should include a `url` key representing the URL to unfurl,
and optionally a `max-depth` key representing how many redirects to follow before giving up.
The default max-depth if not specified is `6`.

The worker will try to unfurl nested redirects as far as it can, but it may timeout before it reaches the end.
In those cases, you should be prepared to handle errors. The worker may also throw other errors on invalid input.

> Warning: This worker doesn't cache anything, and will blindly attempt to unfurl any url you give it.
> If ratelimits or speed are concerns, make sure you do caching elsewhere.

## Return Values

The worker defines the response status codes listed in the table below.
Clicking on any of the status codes will take you to the section with more details
about the causes, and expected output of those codes.

| Code        | Description                    |
| ----------- | ------------------------------ |
| [200](#200) | Success.                       |
| [400](#400) | Input error.                   |
| [416](#416) | Max depth reached.             |
| [418](#418) | Unset location, panic!         |
| 5xx         | Internal error, please report. |

### 200

This is returned if:

- You've made a non-POST request to the server. Make a POST request instead.
- We've managed to successfully unfurl the redirect.

You can expect the following JSON response if it's the latter:

```json
{
  "destination": "The actual URL behind the redirects.",
  "depth": "int. The actual number of redirects followed."
}
```

### 400

If you receive this error, it can indicate one of multiple things.
It can either indicate an error with the input you passed in, or an error fetching some URL.

In the case of a 400, expect a JSON response body as follows:

```JSON
{
  "error": "Explanation of what went wrong."
}
```

### 416

This error indicates that the worker has hit the maximum redirects allowable,
be that the one set by `max-depth`, or other system limitations.

In this case, expect the following JSON response body:

```JSON
{
  "error": "Details about the type of limit hit.",
  "depth": "int. Current depth at time of failure",
  "final": "The final URL we made a request to, before reaching the limit.",
  "next": "The next URL in the chain. Can be useful if you intend on continuing in another worker."
}
```

### 418

You should theoretically never have to deal with this error. If a request returns
a 301 or 301, it is expected to return a `location` header. If it does not,
no browser will follow the redirect, and the link will be broken.

This sort of thing is either the work of a bug in the redirection,
or a computer scientist looking to prove a point. Either way, you should panic!

Expect the following JSON response body:

```JSON
{
  "error": "Details about the error.",
  "depth": "int. Current depth at time of failure",
  "final": "The URL which returned the missing location header."
}
```
