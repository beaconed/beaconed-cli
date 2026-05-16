import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';
import registerScores from './scores.js';
import registerOptimizations from './optimizations.js';

export default function registerProducts(program: Command): void {
  const products = program
    .command('products')
    .description('Manage and inspect products');
  registerList(products);
  registerGet(products);
  registerScores(products);
  registerOptimizations(products);
}
