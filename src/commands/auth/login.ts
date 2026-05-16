/**
 * beaconed auth login
 *
 * Prompts for an API key (or reads $BEACONED_API_KEY) and saves to the XDG config file.
 */

import { createInterface } from 'node:readline';
import type { Command } from 'commander';
import { writeConfigFile } from '../../config.js';
import { run } from '../../error-handler.js';

async function promptApiKey(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    rl.question('Enter your Beaconed API key: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export default function register(parent: Command): void {
  parent
    .command('login')
    .description('Save an API key to the local config file')
    .action(async () => {
      await run(async () => {
        let apiKey = process.env['BEACONED_API_KEY'];

        if (apiKey) {
          process.stderr.write('Using API key from $BEACONED_API_KEY\n');
        } else {
          apiKey = await promptApiKey();
        }

        if (!apiKey) {
          process.stderr.write('error: API key cannot be empty\n');
          process.exit(1);
        }

        const filePath = writeConfigFile(apiKey);
        process.stdout.write(`Saved to ${filePath}\n`);
      });
    });
}
