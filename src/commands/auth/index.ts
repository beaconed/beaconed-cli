import { Command } from 'commander';
import registerLogin from './login.js';
import registerWhoami from './whoami.js';

export default function registerAuth(program: Command): void {
  const auth = program
    .command('auth')
    .description('Manage authentication');
  registerLogin(auth);
  registerWhoami(auth);
}
