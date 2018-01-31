import { spawn, spawnSync } from 'child_process';
import { highlightString, calculateScrollDistance } from '../util/parsing';
import * as blessed from 'blessed';

export interface Block {
  block: string;
  offset: number;
}

/**
 * Base class for handling command parser display and navigation
 */
export abstract class Command {
  program: any;
  gilt: blessed.Widgets.Screen;
  display: blessed.Widgets.BoxElement;

  contentToParse: string;
  coreDataBlocks: Block[];
  selectedBlock = 0;
  scrolledLines = 0;

  /**
   * Run the specified git subcommand, set up the blessed program display and
   * handle some defaults
   *
   * @param string git subcommand to run. The output of this command is parsed and used
   */
  run(command) {
    this.program = (blessed as any).program();
    const { screen, box, escape } = blessed;

    // Run the user's intended command
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

    // If the intended command returns an error, display it and exit with failure
    if (error) {
      console.error(error);
      process.exit(1);
    }

    // Parse the content of the output and divide it into data blocks based on
    // the parser implementation (per command)
    this.coreDataBlocks = this.parseData(this.contentToParse);

    // No available usable output (or no hashes to navigate) so we simply exit
    if (!this.coreDataBlocks) {
      console.log(this.contentToParse);
      process.exit();
    }

    // Display the initial result of the intended command and select the first
    // data block found
    this.display.setContent(
      highlightString(
        this.contentToParse,
        this.coreDataBlocks[0].block,
        this.coreDataBlocks[0].offset,
      ),
    );

    this.gilt.append(this.display);
    this.display.focus();
    this.gilt.render();
  }

  // FIXME make this OS-independent
  // FIXME check for lack of installation of required executables
  copyToClipboard(text) {
    const pbcopy = spawn('reattach-to-user-namespace', ['pbcopy']);
    pbcopy.stdin.write(text);
    pbcopy.stdin.end();
  }

  /**
   * Select another data block. This function handles the internal selection
   * of the block, scrolls the content as needed and updates the display.
   *
   * @param number ID of the next data block to select.
   */
  navigate(nextBlockIdx) {
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
    if (nextBlockIdx > this.selectedBlock) {
      boundaryCheck = this.selectedBlock < this.coreDataBlocks.length - 1;
      // Selected block position is off screen or at least 5 lines near the
      // bottom of the screen (buffer). A safety check is also added to ensure
      // that if the display is scrolled as far as the scroll height scrolling
      // is stopped but this shouldn't happen under normal circumstances
      isOffScreen = () =>
        this.scrolledLines > +this.display.getScroll() - 5 &&
        +this.display.getScroll() < +this.display.getScrollHeight();
      earlierBlock = this.coreDataBlocks[this.selectedBlock];
      laterBlock = this.coreDataBlocks[nextBlockIdx];
      scrollingMultiplier = 1;
    } else {
      // User is navigating backwards
      boundaryCheck = this.selectedBlock > 0;
      // Selected block is off the top of the screen or 5 lines near the top.
      // Since the display can't scroll before 0, cancel scrolling as a safety
      // measure, but this shouldn't happen under normal circumstances
      isOffScreen = () =>
        this.scrolledLines < +this.display.getScroll() + 5 &&
        this.display.getScroll() > 0;
      earlierBlock = this.coreDataBlocks[nextBlockIdx];
      laterBlock = this.coreDataBlocks[this.selectedBlock];
      scrollingMultiplier = -1;
    }

    if (boundaryCheck) {
      const scrollDistance = calculateScrollDistance(
        this.contentToParse,
        earlierBlock.offset,
        laterBlock.offset,
      );
      this.gilt.debug(scrollDistance);
      this.scrolledLines += scrollDistance * scrollingMultiplier;

      // Effectively select this block
      this.selectedBlock = nextBlockIdx;

      this.display.setContent(
        highlightString(
          this.contentToParse,
          this.coreDataBlocks[this.selectedBlock].block,
          this.coreDataBlocks[this.selectedBlock].offset,
        ),
      );

      // Continue to scroll the user as long as the selected block is offscreen
      // TODO perhaps handle this with `scrollTo(scrolledLines)`
      while (isOffScreen()) {
        this.display.scroll(scrollDistance * scrollingMultiplier);
      }
      this.gilt.render();
    }
  }

  searchInput() {
    const { textbox } = blessed;

    const searchInput = textbox({
      height: 1,
      top: '100%-1',
      inputOnFocus: true,
    });

    this.gilt.append(searchInput);
    this.gilt.render();
    searchInput.focus();
  }

  /**
   * Implementation of the command parser. This creates the data blocks the
   * user can select and navigate between. This is dependent on the git command
   * and individual parsers are created to handle the specifics.
   * @param string command content output to parse
   */
  abstract parseData(content: String): Block[];
}
