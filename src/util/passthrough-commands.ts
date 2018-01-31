export const passthroughCommands = [
  'help',
  'clone',
  'config',
  'init',
  'add',
  'mv',
  'reset',
  'rm',
  'bisect',
  'grep',
  'show',
  'branch',
  'checkout',
  'commit',
  'diff',
  'merge',
  'rebase',
  'tag',
  'fetch',
  'pull',
  'push',
];

export const giltCommands = ['log', 'status'];

export const commands = [...passthroughCommands, ...giltCommands];
