export const passthroughCommands = [
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
  'status',
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

export const giltCommands = [
  'log',
];

export const commands = [
  ...passthroughCommands,
  ...giltCommands,
];

