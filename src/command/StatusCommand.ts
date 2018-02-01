import { Command } from './Command';

export class StatusCommand extends Command {
  run() {
    this.navigator.key(['j', 'down'], () => this.navigator.navigateNext());

    this.navigator.key(['k', 'up'], () => this.navigator.navigatePrev());

    this.navigator.key(['y'], () => {
      this.program.copyToClipboard(this.navigator.getSelectedBlock().block);
    });

    this.navigator.key(['enter', 'e'], () => {
      this.program.clear();
      this.program.spawn(process.env.EDITOR, [
        this.navigator.getSelectedBlock().block,
      ]);
    });
  }
}
