import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';

export default function registerOptimizations(program: Command): void {
  const optimizations = program
    .command('optimizations')
    .description('Inspect and filter optimizations');
  registerList(optimizations);
  registerGet(optimizations);
}
