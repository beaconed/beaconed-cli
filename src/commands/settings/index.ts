import { Command } from 'commander';
import registerGet from './get.js';

export default function registerSettings(program: Command): void {
  const settings = program
    .command('settings')
    .description('View account settings');
  registerGet(settings);
}
