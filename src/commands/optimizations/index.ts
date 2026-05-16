import { Command } from 'commander';
import registerList from './list.js';
import registerGet from './get.js';
import registerApprove from './approve.js';
import registerReject from './reject.js';
import registerApply from './apply.js';
import registerRevert from './revert.js';

export default function registerOptimizations(program: Command): void {
  const optimizations = program
    .command('optimizations')
    .description('Inspect and filter optimizations');
  registerList(optimizations);
  registerGet(optimizations);
  registerApprove(optimizations);
  registerReject(optimizations);
  registerApply(optimizations);
  registerRevert(optimizations);
}
