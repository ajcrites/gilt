import { parseFiles } from '../util/parsing';
import { Command } from './Command';

export class StatusParser extends Command {
  parseData(content) {
    const files = parseFiles(content);

    return files.map(file => ({ block: file.file, offset: file.offset }));
  }

  run(command) {
    super.run(command);

    this.display.key(['j', 'down'], () =>
      this.navigate(this.selectedBlock + 1),
    );

    this.display.key(['k', 'up'], () => this.navigate(this.selectedBlock - 1));

    this.display.key(['y'], () => {
      this.copyToClipboard(this.coreDataBlocks[this.selectedBlock].block);
    });

    this.display.key(['enter', 'e'], () => {
      this.program.clear();
      this.gilt.spawn(
        process.env.EDITOR,
        [this.coreDataBlocks[this.selectedBlock].block],
        {},
      );
    });
  }
}
