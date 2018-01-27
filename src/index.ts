#!/usr/bin/env node
import { passThrough } from './command/passthrough';
import { guessCommand } from './util/guess-command';
import { Command } from './command/Command';
import { LogParser } from './command/log';
import { StatusParser } from './command/status';

export function run() {
  const fullCommand = process.argv.slice(2);
  const gitCommand = guessCommand(fullCommand[0]);
  let command: Command;

  switch (gitCommand) {
    case 'status':
      command = new StatusParser();
      break;

    case 'log':
      command = new LogParser();
      break;

    default:
      return passThrough(fullCommand);
  }

  command.run(fullCommand);
}

if (require.main === module) {
  run();
}
