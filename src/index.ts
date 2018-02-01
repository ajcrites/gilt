#!/usr/bin/env node
import * as blessed from 'blessed';

import { giltCommands } from './util/passthrough-commands';
import { passThrough } from './command/passthrough';
import { guessCommand } from './util/guess-command';
import { LogCommand } from './command/LogCommand';
import { StatusCommand } from './command/StatusCommand';
import { Block } from './command/Block';
import { CommandConstructor } from './command/Command';

import { GiltNavigator } from './command/gilt/GiltNavigator';
import { GiltProgram } from './command/gilt/GiltProgram';

import { parseHashes, parseFiles } from './util/parsing';

/**
 * Parse the attempted command and run the appropriate parser
 */
export function run() {
  const fullCommand = process.argv.slice(2);
  const gitCommand = guessCommand(fullCommand[0]);

  if (!giltCommands.includes(gitCommand)) {
    return passThrough(fullCommand);
  }

  const { screen, box } = blessed;
  const program = (blessed as any).program();
  const giltScreen = screen();
  const giltDisplay = box({
    tags: true,
    scrollable: true,
  });
  giltScreen.append(giltDisplay);

  const giltProgram = new GiltProgram(giltScreen, program);
  const giltNavigator = new GiltNavigator(giltScreen, giltDisplay);

  const content = giltProgram.start(fullCommand);

  let commandConstructor: CommandConstructor;
  let navigationBlocks: Block[];
  switch (gitCommand) {
    case 'status':
      navigationBlocks = parseFiles(content).map(block => ({
        block: block.file,
        offset: block.offset,
      }));
      commandConstructor = StatusCommand;
      break;

    case 'log':
      navigationBlocks = parseHashes(content).map(block => ({
        block: block.hash,
        offset: block.offset,
      }));
      commandConstructor = LogCommand;
      break;
  }

  giltNavigator.setContent(content, navigationBlocks);
  const giltCommand = new commandConstructor(giltProgram, giltNavigator);

  giltCommand.run();
}

if (require.main === module) {
  run();
}
