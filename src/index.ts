import { passThrough } from './command/passthrough';
import { Gilt } from './Gilt';
import { guessCommand } from './util/guess-command';
import { giltCommands } from './util/passthrough-commands';

export function parseArgs() {
  return process.argv.slice(2);
}

export function run() {
  const fullCommand = parseArgs();
  const gitCommand = guessCommand(fullCommand[0]);

  if (!giltCommands.includes(gitCommand)) {
    passThrough(fullCommand);
    process.exit(0);
  }

  const gilt = new Gilt();
  gilt.start(fullCommand);
  gilt.run(gitCommand, fullCommand);
}
