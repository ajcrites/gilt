import { spawnSync } from 'child_process';
import { highlightString, calculateScrollDistance } from '../util/parsing';
import * as blessed from 'blessed';

export interface Block {
  block: string;
  offset: number;
}

export abstract class Command {
  program: any;
  gilt: blessed.Widgets.Screen;
  display: blessed.Widgets.BoxElement;

  contentToParse: string;
  coreDataBlocks: Block[];
  selectedBlock = 0;
  scrolledLines = 0;

  run(command) {
    this.program = (blessed as any).program();
    const { screen, box, escape } = blessed;

    const { stdout, stderr } = spawnSync('git', [
      '-c',
      'color.ui=always',
      ...command,
    ]);

    this.gilt = (screen as any)({ debug: true });
    this.display = box({
      tags: true,
      scrollable: true,
    });

    this.gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));
    // TODO check if the additional newlines help
    this.contentToParse = escape(stdout.toString()) + '\n\n';

    const error = stderr.toString();

    if (error) {
      console.error(error);
      process.exit(1);
    }

    this.coreDataBlocks = this.parseData(this.contentToParse);

    // No available usable output (or no hashes to navigate) so we simply exit
    if (!this.coreDataBlocks) {
      console.log(this.contentToParse);
      process.exit();
    }

    this.display.setContent(highlightString(this.contentToParse, this.coreDataBlocks[0].block, this.coreDataBlocks[0].offset));

    this.gilt.append(this.display);
    this.gilt.render();
  }

  navigate(nextBlockIdx) {
    let directionalCheck: boolean;
    let isOffScreen: () => boolean;
    let earlierBlock: Block;
    let laterBlock: Block;
    let scrollingMultiplier: number;
    if (nextBlockIdx > this.selectedBlock) {
      directionalCheck = this.selectedBlock < this.coreDataBlocks.length - 1;
      isOffScreen = () => this.scrolledLines > +this.display.getScroll() - 5 && +this.display.getScroll() < +this.display.getScrollHeight();
      earlierBlock = this.coreDataBlocks[this.selectedBlock];
      laterBlock = this.coreDataBlocks[nextBlockIdx];
      scrollingMultiplier = 1;
    }
    else {
      directionalCheck = this.selectedBlock > 0;
      isOffScreen = () => this.scrolledLines < +this.display.getScroll() + 5 && this.display.getScroll() > 0;
      earlierBlock = this.coreDataBlocks[nextBlockIdx];
      laterBlock = this.coreDataBlocks[this.selectedBlock];
      scrollingMultiplier = -1;
    }

    if (directionalCheck) {
      const scrollDistance = calculateScrollDistance(this.contentToParse, earlierBlock.offset, laterBlock.offset);
      this.gilt.debug(scrollDistance);
      this.scrolledLines += scrollDistance * scrollingMultiplier;

      this.selectedBlock = nextBlockIdx;

      this.display.setContent(highlightString(this.contentToParse, this.coreDataBlocks[this.selectedBlock].block, this.coreDataBlocks[this.selectedBlock].offset));

      while (isOffScreen()) {
        this.display.scroll(scrollDistance * scrollingMultiplier);
      }
      this.gilt.render();
    }
  }

  abstract parseData(content: String): Block[];
}
