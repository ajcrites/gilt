import { Block } from './Block';

/**
 * Interface for handling default functionality for moving around the screen
 */
export interface Navigator {
  content: string;
  navigationBlocks: Block[];
  selectedBlockIdx: number;

  /**
   * Set the navigational content
   * @param content original unparsed content for display
   * @param blocks for navigation handling
   */
  setContent(content: string, blocks: Block[]);

  /**
   * Start up the program and interface
   * @param command array of command line arguments for git command to run
   * @return content of run command used to parse for navigation
   */
  key(keys: string[], listener: () => void);

  /**
   * @return the currently selected block
   */
  getSelectedBlock(): Block;

  /**
   * Navigate to the next block index relative to the selection
   */
  navigateNext();

  /**
   * Navigate to the previous block index relative to the selection
   */
  navigatePrev();

  /**
   * Navigate to the selected block index
   */
  navigateTo(blockIdx: number);

  /**
   * Create a textbox for specifying search input for navigation
   */
  displaySearchInput();

  /**
   * Clear the screen
   */
  clear();
}
