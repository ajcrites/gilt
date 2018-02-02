import { textbox, Widgets } from 'blessed';
import { Navigator } from '../Navigator';
import { Block } from '../Block';

import { calculateScrollDistance, highlightString } from '../../util/parsing';

export class MissingBlockError extends Error {}

export class GiltNavigator implements Navigator {
  screen: Widgets.Screen;
  display: Widgets.BoxElement;
  content = '';
  navigationBlocks = [];
  selectedBlockIdx = 0;

  private scrolledLines = 0;

  constructor(screen: Widgets.Screen, display: Widgets.BoxElement) {
    this.screen = screen;
    this.display = display;
  }

  setContent(content, blocks: Block[]) {
    this.content = content;
    this.navigationBlocks = blocks;
    const currentBlock = this.getSelectedBlock();

    this.display.setContent(
      highlightString(this.content, currentBlock.block, currentBlock.offset),
    );
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

  navigateNext() {
    this.navigateTo(this.selectedBlockIdx + 1);
  }

  navigatePrev() {
    this.navigateTo(this.selectedBlockIdx - 1);
  }

  navigateTo(blockIdx) {
    // Whether the nextBlockIdx is valid to select
    let boundaryCheck: boolean;
    // Whether the next block is offscreen. This helps enforce scroll
    let isOffScreen: () => boolean;
    // The earlier block positionally. This may be the next block if the user
    // is scrolling up
    let earlierBlock: Block;
    // The later block positionally
    let laterBlock: Block;
    // Direction to scroll -- multiply by -1 to scroll up
    let scrollingMultiplier: number;

    // User is navigating forwards
    if (blockIdx > this.selectedBlockIdx) {
      boundaryCheck = this.selectedBlockIdx < this.navigationBlocks.length - 1;
      // Selected block position is off screen or at least 5 lines near the
      // bottom of the screen (buffer). A safety check is also added to ensure
      // that if the display is scrolled as far as the scroll height scrolling
      // is stopped but this shouldn't happen under normal circumstances
      isOffScreen = () =>
        this.scrolledLines > +this.display.getScroll() - 5 &&
        +this.display.getScroll() < +this.display.getScrollHeight();
      earlierBlock = this.navigationBlocks[this.selectedBlockIdx];
      laterBlock = this.navigationBlocks[blockIdx];
      scrollingMultiplier = 1;
    } else {
      // User is navigating backwards
      boundaryCheck = this.selectedBlockIdx > 0;
      // Selected block is off the top of the screen or 5 lines near the top.
      // Since the display can't scroll before 0, cancel scrolling as a safety
      // measure, but this shouldn't happen under normal circumstances
      isOffScreen = () =>
        this.scrolledLines < +this.display.getScroll() + 5 &&
        this.display.getScroll() > 0;
      earlierBlock = this.navigationBlocks[blockIdx];
      laterBlock = this.navigationBlocks[this.selectedBlockIdx];
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

      this.display.setContent(
        highlightString(
          this.content,
          this.navigationBlocks[this.selectedBlockIdx].block,
          this.navigationBlocks[this.selectedBlockIdx].offset,
        ),
      );

      // Continue to scroll the user as long as the selected block is offscreen
      // TODO perhaps handle this with `scrollTo(scrolledLines)`
      while (isOffScreen()) {
        this.display.scroll(scrollDistance * scrollingMultiplier);
      }
      this.screen.render();
    }
  }

  displaySearchInput() {
    const searchInput = textbox({
      height: 1,
      top: '100%-1',
      inputOnFocus: true,
    });

    this.screen.append(searchInput);
    this.screen.render();
    searchInput.focus();
  }

  clear() {
    this.screen.program.clear();
  }
}
