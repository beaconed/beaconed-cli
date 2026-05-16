# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial scaffold with commander.js command tree
- Global flags: `--api-key`, `--base-url`, `--format`, `--no-color`
- `health` placeholder command (prints "ok")
- `src/config.ts` — XDG-friendly config loader with CLI > env > file priority
- `src/format.ts` — `printJson` and `printTable` output helpers
- CI workflow (GitHub Actions, Node 20, pnpm)
