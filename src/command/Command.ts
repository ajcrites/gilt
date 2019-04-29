import { Program } from './Program';
import { Navigator } from './Navigator';

export interface CommandConstructor {
  new (program: Program, navigator: Navigator): Command;
}

/**
 * Base class for handling command parser display and navigation
 */
export abstract class Command {
  program: Program;
  navigator: Navigator;

  constructor(program: Program, navigator: Navigator) {
    this.program = program;
    this.navigator = navigator;
  }

  /**
   * Run the specified git subcommand, set up the blessed program display and
   * handle some defaults
   *
   * @param string git subcommand to run. The output of this command is parsed and used
   */
  abstract run(): void;
}
