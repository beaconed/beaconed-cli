import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';
import registerEvents from './events.js';

export default function registerWebhooks(program: Command): void {
  const webhooks = program
    .command('webhooks')
    .description('Manage webhook subscriptions');
  registerList(webhooks);
  registerGet(webhooks);
  registerEvents(webhooks);
}
