import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';
import registerEvents from './events.js';
import registerCreate from './create.js';
import registerUpdate from './update.js';
import registerDelete from './delete.js';
import registerTest from './test.js';

export default function registerWebhooks(program: Command): void {
  const webhooks = program
    .command('webhooks')
    .description('Manage webhook subscriptions');
  registerList(webhooks);
  registerGet(webhooks);
  registerEvents(webhooks);
  registerCreate(webhooks);
  registerUpdate(webhooks);
  registerDelete(webhooks);
  registerTest(webhooks);
}
