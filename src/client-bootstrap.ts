/**
 * client-bootstrap — builds a configured BeaconedClient from CLI options,
 * env vars, and the XDG config file.
 *
 * Priority: --api-key flag > BEACONED_API_KEY env > config file
 */

import { BeaconedClient } from '@joshre/beaconed-api-client';
import { resolveConfig } from './config.js';
import { NoApiKeyError } from './error-handler.js';

export interface GlobalOpts {
  apiKey?: string;
  baseUrl?: string;
  format?: string;
  page?: string;
  perPage?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

export interface ClientResult {
  client: BeaconedClient;
  dryRun: boolean;
  baseUrl: string;
}

export function getClient(opts: GlobalOpts): BeaconedClient {
  const config = resolveConfig({
    apiKey: opts.apiKey,
    baseUrl: opts.baseUrl,
    format: opts.format,
  });

  if (!config.apiKey) {
    throw new NoApiKeyError();
  }

  return new BeaconedClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    userAgent: '@joshre/beaconed-cli/0.0.1',
  });
}

/**
 * Like getClient but also surfaces the dryRun flag and resolved baseUrl.
 * Use this in mutation commands so they can check opts.dryRun before calling the API.
 */
export function getClientResult(opts: GlobalOpts): ClientResult {
  const config = resolveConfig({
    apiKey: opts.apiKey,
    baseUrl: opts.baseUrl,
    format: opts.format,
  });

  const dryRun = opts.dryRun === true;

  // For dry-run we still need a client instance for URL building, but we allow a
  // missing API key (dry-run never contacts the network).
  if (!config.apiKey && !dryRun) {
    throw new NoApiKeyError();
  }

  const client = new BeaconedClient({
    apiKey: config.apiKey ?? 'dry-run-placeholder',
    baseUrl: config.baseUrl,
    userAgent: '@joshre/beaconed-cli/0.0.1',
  });

  return { client, dryRun, baseUrl: config.baseUrl };
}

export function getFormat(opts: GlobalOpts): 'table' | 'json' {
  const config = resolveConfig({ format: opts.format });
  return config.format;
}

export function getPagination(opts: GlobalOpts): { page?: number; perPage?: number } {
  return {
    page: opts.page !== undefined ? parseInt(opts.page, 10) : undefined,
    perPage: opts.perPage !== undefined ? parseInt(opts.perPage, 10) : undefined,
  };
}
