import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';
import registerScores from './scores.js';
import registerOptimizations from './optimizations.js';
import registerCreate from './create.js';
import registerUpdate from './update.js';
import registerSync from './sync.js';
import registerOptimize from './optimize.js';
import registerCalculateScore from './calculate-score.js';

export default function registerProducts(program: Command): void {
  const products = program
    .command('products')
    .description('Manage and inspect products');
  registerList(products);
  registerGet(products);
  registerScores(products);
  registerOptimizations(products);
  registerCreate(products);
  registerUpdate(products);
  registerSync(products);
  registerOptimize(products);
  registerCalculateScore(products);
}
