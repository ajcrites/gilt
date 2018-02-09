import * as blessed from 'blessed';
import { Navigator } from '../Navigator';
import { Block } from '../Block';

import { calculateScrollDistance, highlightString } from '../../util/parsing';

export class MissingBlockError extends Error {}

export class GiltNavigator implements Navigator {
  screen: blessed.Widgets.Screen;
  display: blessed.Widgets.BoxElement;
  content = '';
  navigationBlocks = [];
  selectedBlockIdx = 0;

  private scrolledLines = 0;

  constructor(
    screen: blessed.Widgets.Screen,
    display: blessed.Widgets.BoxElement,
  ) {
    this.screen = screen;
    this.display = display;
  }

  setContent(content, blocks: Block[]) {
    this.content = content;
    this.navigationBlocks = blocks;

    this.setContentForDisplay();
    this.screen.render();
  }

  key(keys, listener) {
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

  navigateTo(blockIdx) {
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
      // User is navigating backwards
      boundaryCheck = this.selectedBlockIdx > 0;
      // Selected block is off the top of the screen or 5 lines near the top.
      // Since the display can't scroll before 0, cancel scrolling as a safety
      // measure, but this shouldn't happen under normal circumstances
      earlierBlock = this.navigationBlocks[blockIdx];
      laterBlock = this.navigationBlocks[this.selectedBlockIdx];

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
    const selectedBlock = this.navigationBlocks[this.selectedBlockIdx];
    const highlightedContent = highlightString(
      this.content,
      selectedBlock.block,
      selectedBlock.offset,
    );

    const displaySpace = +this.display.width * +this.display.height;

    this.display.setContent(
      highlightedContent.substring(
        Math.max(0, selectedBlock.offset - displaySpace),
        selectedBlock.offset + displaySpace,
      ),
    );
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

  clear() {
    // This is the only way I can clear the screen consistently
    // this.screen.program.clear() does not work, nor does clearRegion
    blessed.program().clear();
  }
}
