import { box, screen } from 'blessed';

import { Block } from './command/Block';
import { CommandConstructor } from './command/Command';
import { GiltNavigator } from './command/gilt/GiltNavigator';
import { GiltProgram } from './command/gilt/GiltProgram';
import { LogCommand } from './command/LogCommand';
import { Navigator } from './command/Navigator';
import { passThrough } from './command/passthrough';
import { Program } from './command/Program';
import { StatusCommand } from './command/StatusCommand';
import { parseFiles, parseHashes } from './util/parsing';

export class Gilt {
  content: string;
  command: string[];
  program: Program;
  navigator: Navigator;

  /* istanbul ignore next */
  start(fullCommand: string[]) {
    this.command = fullCommand;
    const giltScreen = screen();
    const giltDisplay = box({
      tags: true,
      scrollable: true,
    });
    giltScreen.append(giltDisplay);

    this.program = new GiltProgram(giltScreen);
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
          valid: true,
        }));
        commandConstructor = StatusCommand;
        break;

      case 'log':
        navigationBlocks = parseHashes(this.content).map(block => ({
          block: block.hash,
          offset: block.offset,
          valid: true,
        }));
        commandConstructor = LogCommand;
        break;

      // TODO remove dependency on fullCommand and handle using a null class
      default:
        passThrough(fullCommand);
        break;
    }

    if (navigationBlocks.length > 0) {
      this.navigator.setContent(this.content, navigationBlocks);
      const command = new commandConstructor(this.program, this.navigator);
      command.run();
    }
  }
}
