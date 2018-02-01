import * as blessed from 'blessed';
import { Navigator } from './command/Navigator';
import { Program } from './command/Program';

import { GiltNavigator } from './command/gilt/GiltNavigator';
import { GiltProgram } from './command/gilt/GiltProgram';

import { LogCommand } from './command/LogCommand';
import { StatusCommand } from './command/StatusCommand';
import { Block } from './command/Block';
import { CommandConstructor } from './command/Command';

import { parseHashes, parseFiles } from './util/parsing';
import { passThrough } from './command/passthrough';

export class Gilt {
  content: string;
  command: string;
  program: Program;
  navigator: Navigator;

  start(fullCommand) {
    this.command = fullCommand;
    const { screen, box } = blessed;
    const program = (blessed as any).program();
    const giltScreen = screen();
    const giltDisplay = box({
      tags: true,
      scrollable: true,
    });
    giltScreen.append(giltDisplay);

    this.program = new GiltProgram(giltScreen, program);
    this.content = this.program.start(fullCommand);
    this.navigator = new GiltNavigator(giltScreen, giltDisplay);
  }

  /**
   * Parse the attempted command and run the appropriate parser
   */
  run(gitCommand: string, fullCommand: string[]) {
    let commandConstructor: CommandConstructor;
    let navigationBlocks: Block[];
    switch (gitCommand) {
      case 'status':
        navigationBlocks = parseFiles(this.content).map(block => ({
          block: block.file,
          offset: block.offset,
        }));
        commandConstructor = StatusCommand;
        break;

      case 'log':
        navigationBlocks = parseHashes(this.content).map(block => ({
          block: block.hash,
          offset: block.offset,
        }));
        commandConstructor = LogCommand;
        break;

      // TODO remove dependency on fullCommand and handle using a null class
      default:
        passThrough(fullCommand);
        break;
    }

    this.navigator.setContent(this.content, navigationBlocks);
    const command = new commandConstructor(this.program, this.navigator);
    command.run();
  }
}