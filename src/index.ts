#!/usr/bin/env node
import { passThrough } from './command/passthrough';
import { guessCommand } from './util/guess-command';
import { logParser } from './command/log';
import { statusParser } from './command/status';

export function run() {
  const fullCommand = process.argv.slice(2);
  const gitCommand = guessCommand(fullCommand[0]);

  switch (gitCommand) {
    case 'status':
      statusParser(fullCommand);
      break;

    case 'log':
      logParser(fullCommand);
      break;

    default:
      passThrough(fullCommand);
  }
}

if (require.main === module) {
  run();
}
