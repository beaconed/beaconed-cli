# beaconed-cli

Command-line interface for the Beaconed v1 API — manage products, optimizations, scores, settings, and webhooks from your shell or CI.

> **M2b (read-only).** All commands in this milestone are read-only. Mutation commands (approve, apply, create, delete) land in M3.

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

## Command reference

| Group | Command | Description |
|-------|---------|-------------|
| auth | `auth login` | Save API key to config file |
| auth | `auth whoami` | Verify auth, print account settings |
| products | `products list` | List products (filterable) |
| products | `products get <id>` | Get product detail |
| products | `products scores <id>` | Score history for a product |
| products | `products optimizations <id>` | Optimizations for a product |
| optimizations | `optimizations list` | List all optimizations |
| optimizations | `optimizations get <id>` | Get optimization detail |
| scores | `scores list` | Global score list |
| scores | `scores latest` | Latest scores across all products |
| settings | `settings get` | Get account settings |
| webhooks | `webhooks list` | List webhook subscriptions |
| webhooks | `webhooks get <id>` | Get webhook detail |
| webhooks | `webhooks events` | Global webhook event catalog |

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
