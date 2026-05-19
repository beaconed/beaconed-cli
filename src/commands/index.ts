/**
 * Barrel: registers all command groups on the root program.
 */

import type { Command } from 'commander';
import registerAuth from './auth/index.js';
import registerProducts from './products/index.js';
import registerOptimizations from './optimizations/index.js';
import registerScores from './scores/index.js';
import registerSettings from './settings/index.js';
import registerWebhooks from './webhooks/index.js';
import registerBulk from './bulk/index.js';

export function registerAll(program: Command): void {
  registerAuth(program);
  registerProducts(program);
  registerOptimizations(program);
  registerScores(program);
  registerSettings(program);
  registerWebhooks(program);
  registerBulk(program);
}
