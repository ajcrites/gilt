import { Program } from '../Program';
import { spawn, spawnSync } from 'child_process';
import { Widgets, BlessedProgram, escape } from 'blessed';

export class GiltProgram implements Program {
  screen: Widgets.Screen;
  program: BlessedProgram;

  constructor(screen: Widgets.Screen, program: BlessedProgram) {
    this.screen = screen;
    this.program = program;
  }

  clear() {
    (this.program as any).clear();
  }

  start(command) {
    const { stdout, stderr } = spawnSync('git', [
      '-c',
      'color.ui=always',
      ...command,
    ]);

    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    const error = stderr.toString();

    if (error) {
      console.error(error);
      process.exit(1);
    }

    return escape(stdout.toString());
  }

  copyToClipboard(text) {
    const pbcopy = spawn('reattach-to-user-namespace', ['pbcopy']);
    pbcopy.stdin.write(text);
    pbcopy.stdin.end();
  }

  spawn(command, args = [], options = {}) {
    this.screen.spawn(command, args, options);
  }
}
