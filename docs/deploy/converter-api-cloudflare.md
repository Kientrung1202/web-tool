# Converter API Cloudflare Deployment

Date: 2026-09-03

## Public Routing

Keep the existing public hostname:

```text
pdf.shining.io.vn
```

Cloudflare Tunnel should route this hostname to the `pdf-tools` Nginx service. Do not create a public hostname for `converter-api`.

Expected request path:

```text
Browser -> Cloudflare -> Tunnel -> pdf-tools Nginx -> converter-api
```

`converter-api` is only attached to the internal Docker network and has no published Docker `ports`.

## Env Files

Use separate `.env` files for local and production. Start from `.env.template`.

Local example:

```env
# --- Frontend ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000          # Base URL for SEO / Open Graph
NEXT_PUBLIC_TURNSTILE_SITE_KEY=                     # Empty = Turnstile disabled locally
NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB=10            # Upload hint shown in UI

# --- Nginx ---
NGINX_CLIENT_MAX_BODY_SIZE=12m                       # Max body size (slightly above file limit)
NGINX_PROXY_READ_TIMEOUT=90s                         # Proxy wait time before 504

# --- Converter limits ---
CONVERTER_MAX_FILE_SIZE_MB=10                        # Server-side file size cap (MB)
CONVERTER_MAX_FILES_PER_REQUEST=1                    # Only 1 file per request
CONVERTER_MAX_PDF_PAGES=40                           # Max PDF pages for pdf-to-word
CONVERTER_TIMEOUT_SECONDS=80                         # Kill conversion after N seconds
CONVERTER_MAX_CONCURRENT_JOBS=1                      # Parallel jobs (keep low locally)
CONVERTER_QUEUE_MAX_SIZE=3                           # Waiting queue before HTTP 429
CONVERTER_TEMP_TTL_SECONDS=120                       # Auto-clean temp dirs after N seconds
CONVERTER_TEMP_DIR=/var/tmp/converter/jobs            # Temp directory for conversion I/O
CONVERTER_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8088  # CORS allowed origins
CONVERTER_RATE_LIMIT_WINDOW_SECONDS=60               # Rate limit window (seconds)
CONVERTER_RATE_LIMIT_MAX_REQUESTS=10                 # Max requests per IP per window

# --- Security ---
CONVERTER_INTERNAL_PROXY_TOKEN=local-long-random-secret  # Nginx→converter shared secret
TURNSTILE_SECRET_KEY=                                    # Empty = skip Turnstile verification
```

Production example:

```env
# --- Frontend ---
NEXT_PUBLIC_SITE_URL=https://pdf.shining.io.vn           # Public site URL
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>  # Turnstile widget key
NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB=20                 # Upload hint shown in UI

# --- Nginx ---
NGINX_CLIENT_MAX_BODY_SIZE=25m                            # Allow 25 MB body (file limit = 20 MB)
NGINX_PROXY_READ_TIMEOUT=130s                             # Long timeout for large conversions

# --- Converter limits ---
CONVERTER_MAX_FILE_SIZE_MB=20                             # Server-side file size cap
CONVERTER_MAX_FILES_PER_REQUEST=1                         # One file at a time
CONVERTER_MAX_PDF_PAGES=80                                # Max pages for pdf-to-word
CONVERTER_TIMEOUT_SECONDS=120                             # Kill conversion after 2 min
CONVERTER_MAX_CONCURRENT_JOBS=2                           # 2 parallel jobs in production
CONVERTER_QUEUE_MAX_SIZE=10                               # Up to 10 waiting requests
CONVERTER_TEMP_TTL_SECONDS=300                            # Clean up after 5 min
CONVERTER_TEMP_DIR=/var/tmp/converter/jobs                 # Absolute path inside container
CONVERTER_ALLOWED_ORIGINS=https://pdf.shining.io.vn       # Only allow production origin
CONVERTER_RATE_LIMIT_WINDOW_SECONDS=60                    # 60-second sliding window
CONVERTER_RATE_LIMIT_MAX_REQUESTS=3                       # Stricter: 3 requests per IP

# --- Security (required in production) ---
CONVERTER_INTERNAL_PROXY_TOKEN=<long-random-secret>              # Generate with: openssl rand -hex 32
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret-key>           # From Cloudflare dashboard
```

## Cloudflare Tunnel

In Cloudflare Zero Trust Tunnel public hostname settings:

- Public hostname: `pdf.shining.io.vn`
- Service type: `HTTP`
- Service URL: the `pdf-tools` Nginx service

If `cloudflared` runs in the same Docker network, route it to:

```text
http://pdf-tools:80
```

If `cloudflared` runs on the host and Docker publishes the frontend through a local port, route it to that local frontend URL. Do not route Cloudflare Tunnel to `converter-api:3001`.

## Turnstile

Create a Turnstile widget for:

```text
pdf.shining.io.vn
```

Set:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the public site key.
- `TURNSTILE_SECRET_KEY` to the secret key.

The frontend widget alone is not enough. The converter validates `cf-turnstile-response` with Cloudflare Siteverify before conversion.

## WAF Custom Rules

Rule: block wrong methods for conversion endpoints.

Expression:

```text
(http.host eq "pdf.shining.io.vn" and starts_with(http.request.uri.path, "/api/convert/") and not http.request.method in {"POST" "OPTIONS"})
```

Action: `Block`.

Optional rule: challenge suspicious conversion traffic if your plan exposes bot fields or managed challenge controls.

## Rate Limiting

Rule: limit conversion POST requests.

Expression:

```text
(http.host eq "pdf.shining.io.vn" and starts_with(http.request.uri.path, "/api/convert/") and http.request.method eq "POST")
```

Recommended initial settings:

- Characteristics: IP.
- Rate: `3 requests / 60 seconds`.
- Mitigation timeout: `600 seconds`.
- Action: Managed Challenge if available, otherwise Block.

Cloudflare rate limiting can have enforcement delay, so the converter also has app-level rate limiting.

## Cache Rule

Bypass cache for conversion endpoints.

Expression:

```text
(http.host eq "pdf.shining.io.vn" and starts_with(http.request.uri.path, "/api/convert/"))
```

Action: Bypass cache.

## Upload Size

Keep Cloudflare's maximum upload size above the app limit. Cloudflare documents 100 MB upload limits on Free and Pro plans, while this app defaults to 20 MB.

Recommended:

- Cloudflare zone upload limit: at least `25 MB`.
- `NGINX_CLIENT_MAX_BODY_SIZE=25m`.
- `CONVERTER_MAX_FILE_SIZE_MB=20`.
- `NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB=20`.

## Verification

After deployment:

```bash
docker compose config
docker compose up -d --build
docker compose ps
docker compose exec converter-api curl -s http://127.0.0.1:3001/healthz
```

Check that:

- `converter-api` has no public `ports`.
- `pdf-tools` is attached to both `internal` and `cloudflare` networks.
- `converter-api` is attached only to `internal`.
- `/api/convert/*` is visible only through `pdf.shining.io.vn`.
- Cloudflare Security Events show WAF/rate limit actions when tested.

## References

- Cloudflare Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Cloudflare WAF rate limiting rules: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Cloudflare rate limiting parameters: https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/
- Cloudflare upload size and 413 behavior: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/4xx-client-error/error-413/
