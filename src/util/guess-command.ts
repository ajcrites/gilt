import { spawnSync } from 'child_process';
import { commands } from './passthrough-commands';

export const guessCommand = (command: string) => {
  // This is a normal git command, so pass it on for normal handling
  if (commands.includes(command)) {
    return command;
  }

  // Try to guess the actual git command based on alias
  const { stdout } = spawnSync('git', ['config', `alias.${command}`]);
  const alias = stdout.toString();
  if (alias) {
    return alias.replace(/^([\w-]+).*/, '$1').trim();
  }

  return 'unknown';
};
