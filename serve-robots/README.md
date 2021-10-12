# Serve Robots Worker

This worker is used to serve `robots.txt` files accross our infrastructure.

The worker should be set on `*.example.com/robots.txt` (and optionally `example.com/robots.txt`). Each robot file is defined in the `robots/` directory, the file name being the domain the rule should be served on.
