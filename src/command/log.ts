import { parseHashes } from '../util/parsing';
import { Command } from './Command';

export class LogParser extends Command {
  parseData(content) {
    const hashes = parseHashes(content);

    return hashes.map(hash => ({ block: hash.hash, offset: hash.offset }));
  }

  run(command) {
    super.run(command);

    this.display.key(['j', 'down'], () =>
      this.navigate(this.selectedBlock + 1),
    );

    this.display.key(['k', 'up'], () => this.navigate(this.selectedBlock - 1));

    this.display.key(['enter', 'd'], () => {
      this.program.clear();
      this.gilt.spawn(
        'git',
        [
          '-c',
          'core.pager=less -+F',
          'show',
          '-w',
          this.coreDataBlocks[this.selectedBlock].block,
        ],
        {},
      );
    });

    this.display.key(['y'], () => {
      this.copyToClipboard(this.coreDataBlocks[this.selectedBlock].block);
    });

    this.display.key(['c'], () => {
      this.gilt.spawn(
        'git',
        ['checkout', this.coreDataBlocks[this.selectedBlock].block],
        {},
      );
      process.exit();
    });
  }
}
