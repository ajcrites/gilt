import { Gilt } from '../Gilt';
import { Program } from '../command/Program';
import { Navigator } from '../command/Navigator';
import { Block } from '../command/Block';

const mockNavigator: Navigator = {
  content: '',
  navigationBlocks: [] as Block[],
  selectedBlockIdx: 0,

  getSelectedBlock: jest.fn(function () {
    return this.navigationBlocks[this.selectedBlockIdx];
  }),

  setContent(content, navigationBlocks) {
    this.content = content;
    this.navigationBlocks = navigationBlocks;
  },
  key() {},
  navigateNext: jest.fn(),
  navigatePrev: jest.fn(),
  navigateTo() {},
  displaySearchInput() {},
  clear: jest.fn(),
  changeSelectedBlockValidity: jest.fn(),
  removeBlock: jest.fn(),
  ask: jest.fn(),
};

const mockProgram: Program = {
  start(command: string[]) {
    return command[0];
  },

  copyToClipboard: jest.fn(),

  spawn: jest.fn(),
};

describe('Gilt', () => {
  it('runs log for log command', () => {
    const gilt = new Gilt();
    const navigator = mockNavigator;
    const listeners = {};

    navigator.key = jest.fn((keys, listener) => {
      keys.forEach(key => {
        listeners[key] = listener;
      });
    });

    const program = mockProgram;
    gilt.program = program;
    gilt.navigator = navigator;
    gilt.content = '2760ad14a1bd475a3ee25a0b20de8490e0f5e0c6';

    gilt.run('log', []);
    listeners['j']();
    listeners['k']();
    listeners['enter']();
    listeners['y']();

    expect(navigator.key).toHaveBeenCalledTimes(7);
    expect(navigator.navigateNext).toHaveBeenCalledTimes(1);
    expect(navigator.navigatePrev).toHaveBeenCalledTimes(1);
    expect(navigator.clear).toHaveBeenCalledTimes(1);
    expect(program.copyToClipboard).toHaveBeenCalledTimes(1);
    expect(program.spawn).toHaveBeenCalledTimes(1);
  });
});
