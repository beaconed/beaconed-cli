# @beaconed/cli

Command-line interface for the Beaconed v1 API. Manage products, optimizations, scores, settings, and webhooks from your shell or CI pipeline.

## Install

```bash
npm install -g @beaconed/cli
```

## Authentication

Three ways to provide your API key, in priority order:

1. `--api-key <key>` flag per command
2. `BEACONED_API_KEY` environment variable
3. Config file saved via `beaconed auth login`

```bash
beaconed auth login         # prompts for your key, saves to ~/.config/beaconed/config.json
export BEACONED_API_KEY=... # or set it in your shell
beaconed products list --api-key bcd_...  # or pass it inline
```

Get your API key at [beaconed.ai](https://beaconed.ai) under Settings > API Keys.

## Quickstart

```bash
beaconed products list
beaconed products show abc-123
beaconed bulk optimize --product-ids abc-123,def-456
beaconed optimizations approve opt-789
beaconed products list --format json | jq '.data[].title'
```

## Global flags

| Flag | Env var | Default |
|------|---------|---------|
| `--api-key <key>` | `BEACONED_API_KEY` | config file |
| `--base-url <url>` | `BEACONED_BASE_URL` | `https://beaconed.ai` |
| `--format table\|json` | `BEACONED_FORMAT` | `table` |
| `--page <n>` | — | 1 |
| `--per-page <n>` | — | 25 |
| `--verbose` | — | — |
| `--dry-run` | — | — |

Pass `--dry-run` on any mutation command to preview the planned request without sending it.

## Commands

```
auth
  auth login                      Save API key to config file
  auth whoami                     Verify auth, print account settings

products
  products list                   List products (filterable by status, grade, score)
  products get <id>               Product detail
  products create                 Create a product from external data
  products update <id>            Update product fields (partial)
  products optimize <id>          Queue AI optimization [EXPENSIVE]
  products sync <id>              Trigger Shopify sync [EXPENSIVE]
  products calculate-score <id>   Recalculate readiness score [EXPENSIVE]
  products scores <id>            Score history for a product
  products optimizations <id>     Optimizations for a product

optimizations
  optimizations list              List all optimizations
  optimizations get <id>          Optimization detail
  optimizations approve <id>      Approve a pending optimization [EXPENSIVE]
  optimizations reject <id>       Reject a pending optimization
  optimizations apply <id>        Apply optimization to live product [EXPENSIVE]
  optimizations revert <id>       Revert an applied optimization [EXPENSIVE]

bulk
  bulk optimize                   Queue optimization for multiple products [EXPENSIVE]

scores
  scores list                     Scores across all products
  scores latest                   Latest score per product

settings
  settings get                    Account optimization settings

webhooks
  webhooks list                   List webhook subscriptions
  webhooks get <id>               Webhook detail
  webhooks create                 Create a webhook subscription
  webhooks update <id>            Update a webhook subscription
  webhooks delete <id>            Delete a webhook subscription
  webhooks events                 Global event type catalog
  webhooks test <id>              Send a test event
```

[EXPENSIVE] commands are rate-limited to 10 requests/minute.

## License

MIT — see [LICENSE](LICENSE).
