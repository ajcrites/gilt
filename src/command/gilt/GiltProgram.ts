import { Program } from '../Program';
import { spawn, spawnSync, ChildProcess } from 'child_process';
import { Widgets, escape } from 'blessed';

export class GiltProgram implements Program {
  screen: Widgets.Screen;

  constructor(screen: Widgets.Screen) {
    this.screen = screen;
  }

  start(command: string[]) {
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

  copyToClipboard(text: string) {
    const pbcopy = spawn('reattach-to-user-namespace', ['pbcopy']);
    pbcopy.stdin.write(text);
    pbcopy.stdin.end();
  }

  spawn(command: string, args: string[] = [], options = {}): ChildProcess {
    return this.screen.spawn(command, args, options);
  }
}
