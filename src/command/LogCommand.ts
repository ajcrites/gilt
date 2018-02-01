import { Command } from './Command';

export class LogCommand extends Command {
  run() {
    this.navigator.key(['j', 'down'], () => this.navigator.navigateNext());

    this.navigator.key(['k', 'up'], () => this.navigator.navigatePrev());

    this.navigator.key(['enter', 'd'], () => {
      this.navigator.clear();
      this.program.spawn('git', [
        '-c',
        'core.pager=less -+F',
        'show',
        '-w',
        this.navigator.getSelectedBlock().block,
      ]);
    });

    this.navigator.key(['y'], () => {
      this.program.copyToClipboard(this.navigator.getSelectedBlock().block);
    });

    this.navigator.key(['c'], () => {
      this.program.spawn('git', [
        'checkout',
        this.navigator.getSelectedBlock().block,
      ]);
      process.exit();
    });
  }
}
