import { guessCommand } from '../util/guess-command';

describe('hello', () => {
  it('guesses command', () => {
    expect(guessCommand('log')).toBe('log');
  });
});
