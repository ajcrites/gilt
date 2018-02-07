import { spawn } from 'child_process';

export const passThrough = command => {
  const ps = spawn('git', ['-c', 'color.ui=always', ...command]);
  ps.stderr.pipe(process.stderr);
  ps.stdout.pipe(process.stdout);
};
