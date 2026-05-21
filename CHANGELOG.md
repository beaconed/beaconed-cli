# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-05-21

### Fixed

- 404 errors now print the request method and full path (e.g.
  `Not found (404): GET /api/v1/scores`) instead of the last URL segment, which
  produced misleading messages like `Not found: scores?per_page=2` for
  collection endpoints. ([#1](https://github.com/beaconed/beaconed-cli/issues/1))

## [0.0.1] - 2026-05-19

### Added

- Initial release.
- Command-line interface for Beaconed v1 API — manage products, optimizations, scores, settings, webhooks.
