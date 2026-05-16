# beaconed-cli

Command-line interface for the Beaconed v1 API — manage products, optimizations, and webhooks from your shell or CI. Built for developers who want scriptable, pipeable access to their Beaconed account without leaving the terminal.

## Quickstart

```
npx @joshre/beaconed-cli products list
```

## Setup

Set your API key (generate one at https://beaconed.ai under Settings > API Keys):

```
export BEACONED_API_KEY=your_api_key_here
```

Or store it in the config file:

```
beaconed auth login
```

Config file location: `~/.config/beaconed/config.json` (respects `$XDG_CONFIG_HOME`).

## Usage

Run `beaconed --help` for the authoritative command reference. All commands accept `--help` for details.

```
beaconed products list
beaconed products get <id>
beaconed optimizations list
beaconed optimizations approve <id>
beaconed webhooks list
beaconed settings get
```

### Global flags

| Flag | Env var | Default |
|------|---------|---------|
| `--api-key <token>` | `BEACONED_API_KEY` | config file |
| `--base-url <url>` | `BEACONED_BASE_URL` | `https://beaconed.ai` |
| `--format table\|json` | `BEACONED_FORMAT` | `table` |
| `--no-color` | `NO_COLOR` | — |

### JSON output

Pass `--format json` to get raw JSON suitable for piping to `jq`:

```
beaconed products list --format json | jq '.[0].title'
```

## Status: alpha

This is an alpha release. The command tree is scaffolded; full API parity lands in M2-M4. See https://beaconed.ai for API documentation and API key generation.
