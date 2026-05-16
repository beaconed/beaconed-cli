import { Command } from 'commander';
import registerList from './list.js';
import registerLatest from './latest.js';

export default function registerScores(program: Command): void {
  const scores = program
    .command('scores')
    .description('View readiness scores across all products');
  registerList(scores);
  registerLatest(scores);
}
