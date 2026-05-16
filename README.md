# beaconed-cli

Command-line interface for the Beaconed v1 API — manage products, optimizations, scores, settings, and webhooks from your shell or CI.

> **M3b.** All mutation commands are now available. See the command reference and dry run sections below.

## Install

Not yet published to npm. Install directly from git:

```
pnpm add github:joshre/beaconed-cli
```

## Quickstart

```
beaconed auth login          # prompts for your API key and saves it
beaconed products list       # list products in a table
beaconed products list --format json | jq '.data[].title'
```

## Auth

Generate an API key at https://beaconed.ai under Settings > API Keys.

Save it interactively:

```
beaconed auth login
```

Or set the environment variable (takes priority over the config file):

```
export BEACONED_API_KEY=your_api_key_here
```

Config file location: `~/.config/beaconed/config.json` (respects `$XDG_CONFIG_HOME`). The file is created with chmod 600.

## Global flags

These flags apply to every command:

| Flag | Env var | Default |
|------|---------|---------|
| `--api-key <key>` | `BEACONED_API_KEY` | config file |
| `--base-url <url>` | `BEACONED_BASE_URL` | `https://beaconed.ai` |
| `--format table\|json` | `BEACONED_FORMAT` | `table` |
| `--page <n>` | — | 1 |
| `--per-page <n>` | — | 25 |
| `--no-color` | — | — |
| `--verbose` | — | — |
| `--dry-run` | — | — |

## Dry run

Pass `--dry-run` to any mutation command to preview the planned API request without sending it. The method, full URL, and request body are printed to stderr. The process exits 0 and no network call is made.

```
beaconed --dry-run products create --title "My Product" --external-id ext-001
# [dry-run] POST https://beaconed.ai/api/v1/products
# [dry-run] body: {
#   "product": {
#     "title": "My Product",
#     "external_id": "ext-001"
#   }
# }
```

Read-only commands (list, get, etc.) ignore `--dry-run` and execute normally.

## Command reference

| Group | Command | Description |
|-------|---------|-------------|
| auth | `auth login` | Save API key to config file |
| auth | `auth whoami` | Verify auth, print account settings |
| products | `products list` | List products (filterable) |
| products | `products get <id>` | Get product detail |
| products | `products scores <id>` | Score history for a product |
| products | `products optimizations <id>` | Optimizations for a product |
| products | `products create` | Create a product from external data |
| products | `products update <id>` | Update product fields (partial) |
| products | `products sync <id>` | Trigger Shopify sync [EXPENSIVE] |
| products | `products optimize <id>` | Queue AI optimization [EXPENSIVE] |
| products | `products calculate-score <id>` | Recalculate readiness score [EXPENSIVE] |
| optimizations | `optimizations list` | List all optimizations |
| optimizations | `optimizations get <id>` | Get optimization detail |
| optimizations | `optimizations approve <id>` | Approve a pending optimization [EXPENSIVE] |
| optimizations | `optimizations reject <id>` | Reject a pending optimization |
| optimizations | `optimizations apply <id>` | Push approved optimization to Shopify [EXPENSIVE] |
| optimizations | `optimizations revert <id>` | Revert an applied optimization [EXPENSIVE] |
| scores | `scores list` | Global score list |
| scores | `scores latest` | Latest scores across all products |
| settings | `settings get` | Get account settings |
| webhooks | `webhooks list` | List webhook subscriptions |
| webhooks | `webhooks get <id>` | Get webhook detail |
| webhooks | `webhooks events` | Global webhook event catalog |
| webhooks | `webhooks create` | Create a webhook subscription |
| webhooks | `webhooks update <id>` | Update a webhook subscription (partial) |
| webhooks | `webhooks delete <id>` | Delete a webhook subscription |
| webhooks | `webhooks test <id>` | Send a test event to a webhook |

> **[EXPENSIVE]** commands are rate-limited to 10 requests/minute.

### Webhook create — one-time secret

When you create a webhook, the API returns a signing secret used to verify payload authenticity. This secret is shown **only once**. In table mode it is printed prominently:

```
Webhook created: wh_abc123
URL: https://example.com/hook
Events: product.scored, optimization.created

SECRET (shown once — store it now): whsec_...
```

In JSON mode (`--format json`) the secret appears as the `secret` field in the response object.

## Filters

**products list:**
`--status active|draft|archived`, `--min-score N`, `--max-score N`, `--grade excellent|good|fair|poor|critical`, `--needs-optimization`, `-q <title search>`

**optimizations list:**
`--status pending|approved|rejected|applied|reverted`, `--field title|description|alt_text|...`, `--product-id <id>`, `--since <ISO8601>`

**products scores / scores list / scores latest:**
`--since <ISO8601>`, `--until <ISO8601>`, `--grade <grade>`

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Generic / network error |
| 2 | Authentication failed (no key or 401) |
| 4 | Resource not found (404) |
| 5 | Rate limited (429) |
| 22 | Validation error (422) |

## JSON output

Pass `--format json` to get machine-readable output. List commands include a `pageInfo` key alongside `data`:

```json
{
  "data": [...],
  "pageInfo": { "page": 1, "perPage": 25, "total": 143, "totalPages": 6 }
}
```

Pipe to `jq` freely:

```
beaconed products list --format json | jq '.data[] | select(.readiness_grade == "poor") | .title'
```
