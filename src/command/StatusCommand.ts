import { Command } from './Command';

export class StatusCommand extends Command {
  run() {
    this.navigator.key(['j', 'down'], () => this.navigator.navigateNext());

    this.navigator.key(['k', 'up'], () => this.navigator.navigatePrev());

    this.navigator.key(['d', 'pagedown'], () => this.navigator.navigateNext(5));

    this.navigator.key(['u', 'pageup'], () => this.navigator.navigatePrev(5));

    this.navigator.key(['y'], () => {
      this.program.copyToClipboard(this.navigator.getSelectedBlock().block);
    });

    this.navigator.key(['f'], () => {
      this.navigator.clear();
      this.program.spawn('git', [
        '-c',
        'core.pager=less -+F',
        'diff',
        '-w',
        this.navigator.getSelectedBlock().block,
      ]);
    });

    this.navigator.key(['enter', 'e'], () => {
      this.navigator.clear();
      this.program.spawn(process.env.EDITOR, [
        this.navigator.getSelectedBlock().block,
      ]);
    });

    this.navigator.key(['x'], () => {
      this.navigator.ask(
        'Are you sure you want to rm this file (y) / (n)?',
        (_, ok) => {
          if (ok) {
            this.program.spawn('rm', [this.navigator.getSelectedBlock().block]);
            this.navigator.changeSelectedBlockValidity(false);
          }
        },
      );
    });
  }
}
