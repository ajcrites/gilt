import * as blessed from 'blessed';

import { calculateScrollDistance, highlightString } from '../../util/parsing';
import { Block } from '../Block';
import { Navigator } from '../Navigator';

export class MissingBlockError extends Error {}

export class GiltNavigator implements Navigator {
  screen: blessed.Widgets.Screen;
  display: blessed.Widgets.BoxElement;
  content = '';
  navigationBlocks: Block[] = [];
  selectedBlockIdx = 0;

  private scrolledLines = 0;

  constructor(
    screen: blessed.Widgets.Screen,
    display: blessed.Widgets.BoxElement,
  ) {
    this.screen = screen;
    this.display = display;
  }

  setContent(content: string, blocks: Block[]) {
    this.content = content;
    this.navigationBlocks = blocks;

    this.setContentForDisplay();
    this.screen.render();
  }

  key(keys: string[], listener: () => void) {
    this.screen.key(keys, listener);
  }

  getSelectedBlock() {
    const currentBlock = this.navigationBlocks[this.selectedBlockIdx];
    if (!currentBlock) {
      throw new MissingBlockError();
    }
    return this.navigationBlocks[this.selectedBlockIdx];
  }

  navigateNext(count = 1) {
    this.navigateTo(this.selectedBlockIdx + count);
  }

  navigatePrev(count = 1) {
    this.navigateTo(this.selectedBlockIdx + -1 * count);
  }

  changeSelectedBlockValidity(valid = false) {
    this.navigationBlocks[this.selectedBlockIdx].valid = valid;
    this.setContentForDisplay();
    this.screen.render();
  }

  removeBlock(blockIdx: number) {
    const removedBlock = this.navigationBlocks[blockIdx];
    if (removedBlock) {
      this.navigationBlocks.splice(blockIdx, 1);

      // Highlight the removed block in black
      this.content = highlightString(
        this.content,
        removedBlock.block,
        'black-bg',
        removedBlock.offset,
      );

      if (this.navigationBlocks.length > 0) {
        while (this.selectedBlockIdx > this.navigationBlocks.length - 1) {
          this.selectedBlockIdx -= 1;
        }
      }

      this.setContentForDisplay();
      this.screen.render();
    }
  }

  navigateTo(blockIdx: number) {
    // Whether the blockIdx is valid to select
    let boundaryCheck: boolean;
    // The earlier block positionally. This may be the next block if the user
    // is scrolling up
    let earlierBlock: Block;
    // The later block positionally
    let laterBlock: Block;
    // Direction to scroll -- multiply by -1 to scroll up
    let scrollingMultiplier: number;

    // User is navigating forwards
    if (blockIdx > this.selectedBlockIdx) {
      // Selected block position is off screen or at least 5 lines near the
      // bottom of the screen (buffer). A safety check is also added to ensure
      // that if the display is scrolled as far as the scroll height scrolling
      // is stopped but this shouldn't happen under normal circumstances
      earlierBlock = this.navigationBlocks[this.selectedBlockIdx];
      laterBlock = this.navigationBlocks[blockIdx];

      boundaryCheck =
        this.selectedBlockIdx < this.navigationBlocks.length - 1 &&
        !!laterBlock;
      scrollingMultiplier = 1;
    } else {
      // Selected block is off the top of the screen or 5 lines near the top.
      // Since the display can't scroll before 0, cancel scrolling as a safety
      // measure, but this shouldn't happen under normal circumstances
      earlierBlock = this.navigationBlocks[blockIdx];
      laterBlock = this.navigationBlocks[this.selectedBlockIdx];

      // User is navigating backwards
      boundaryCheck = this.selectedBlockIdx > 0 && !!earlierBlock;
      scrollingMultiplier = -1;
    }

    if (boundaryCheck) {
      const scrollDistance = calculateScrollDistance(
        this.content,
        earlierBlock.offset,
        laterBlock.offset,
      );
      this.scrolledLines += scrollDistance * scrollingMultiplier;

      // Effectively select this block
      this.selectedBlockIdx = blockIdx;

      this.setContentForDisplay();

      this.display.scrollTo(this.scrolledLines);
    } else {
      // Continue to scroll when a boundary (first/last) block is selected
      // but there is more scroll content offscreen
      this.display.scroll(3 * scrollingMultiplier);
    }
    this.screen.render();
  }

  setContentForDisplay() {
    // Display one full screen of characters
    // There will usually be a lot less than that, so this provides a small
    // buffer of additional display when updating the screen
    const displaySpace = +this.display.width * +this.display.height;

    if (this.navigationBlocks.length > 0) {
      const selectedBlock = this.navigationBlocks[this.selectedBlockIdx];
      const highlightedContent = highlightString(
        this.content,
        selectedBlock.block,
        selectedBlock.valid ? 'white-bg' : 'red-bg',
        selectedBlock.offset,
      );

      this.display.setContent(
        highlightedContent.substring(
          Math.max(0, selectedBlock.offset - displaySpace),
          selectedBlock.offset + displaySpace,
        ),
      );
    } else {
      this.display.setContent(this.content.substring(0, displaySpace));
    }
  }

  displaySearchInput() {
    const searchInput = blessed.textbox({
      height: 1,
      top: '100%-1',
      inputOnFocus: true,
    });

    this.screen.append(searchInput);
    this.screen.render();
    searchInput.focus();
  }

  ask(text: string, cb: () => void) {
    const prompt = blessed.question({
      left: 'center',
      top: 'center',
      width: '30%',
      height: '30%',
      border: 'line',
    });
    prompt.ask(text, cb);

    this.screen.append(prompt);
    this.screen.render();
    prompt.key(['y'], () => {
      prompt._.okay.press();
      this.setContentForDisplay();
      this.screen.render();
    });
    prompt.key(['n'], () => {
      prompt._.cancel.press();
      this.setContentForDisplay();
      this.screen.render();
    });
  }

  clear() {
    // This is the only way I can clear the screen consistently
    // this.screen.program.clear() does not work, nor does clearRegion
    blessed.program().clear();
  }
}
