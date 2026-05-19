import { Command } from 'commander';
import registerOptimize from './optimize.js';

export default function registerBulk(program: Command): void {
  const bulk = program
    .command('bulk')
    .description('Bulk operations across multiple products');
  registerOptimize(bulk);
}
