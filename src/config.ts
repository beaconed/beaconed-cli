import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

export interface ResolvedConfig {
  apiKey: string | undefined;
  baseUrl: string;
  format: 'table' | 'json';
}

interface ConfigFile {
  api_key?: string;
  base_url?: string;
  format?: string;
}

interface CliOverrides {
  apiKey?: string;
  baseUrl?: string;
  format?: string;
}

function configFilePath(): string {
  const xdgBase = process.env['XDG_CONFIG_HOME'] ?? join(homedir(), '.config');
  return join(xdgBase, 'beaconed', 'config.json');
}

function readConfigFile(): ConfigFile {
  try {
    const raw = readFileSync(configFilePath(), 'utf8');
    return JSON.parse(raw) as ConfigFile;
  } catch {
    return {};
  }
}

function normalizeFormat(value: string | undefined): 'table' | 'json' {
  if (value === 'json') return 'json';
  return 'table';
}

/**
 * Write an API key to the XDG config file and chmod 600 it.
 */
export function writeConfigFile(apiKey: string): string {
  const filePath = configFilePath();
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  const content: ConfigFile = { api_key: apiKey };
  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  chmodSync(filePath, 0o600);
  return filePath;
}

/**
 * Resolve config with priority: CLI flags > env vars > config file.
 *
 * CLI flags should be passed as `overrides`. Values that are undefined fall
 * through to the next tier.
 */
export function resolveConfig(overrides: CliOverrides = {}): ResolvedConfig {
  const file = readConfigFile();

  const apiKey =
    overrides.apiKey ??
    process.env['BEACONED_API_KEY'] ??
    file.api_key;

  const baseUrl =
    overrides.baseUrl ??
    process.env['BEACONED_BASE_URL'] ??
    file.base_url ??
    'https://beaconed.ai';

  const formatRaw =
    overrides.format ??
    process.env['BEACONED_FORMAT'] ??
    file.format;

  return {
    apiKey,
    baseUrl,
    format: normalizeFormat(formatRaw),
  };
}
