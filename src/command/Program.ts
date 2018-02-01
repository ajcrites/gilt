/**
 * Interface that represents the running program and handles high level
 * program commands and content handling
 */
export interface Program {
  /**
   * Start up the program and interface
   * @param command array of command line arguments for git command to run
   * @return content of run command used to parse for navigation
   */
  start(command: string[]): string;

  /**
   * Use the program to copy the provided text to the clipboard
   * @param text to copy
   */
  copyToClipboard(text: string): void;

  /**
   * Spawn a separate process
   */
  spawn(command: string, args?: string[], options?: {});

  /**
   * Clear the screen
   */
  clear(): void;
}
