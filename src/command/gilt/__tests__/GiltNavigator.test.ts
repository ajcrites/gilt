import * as blessed from 'blessed';
import { GiltNavigator } from '../GiltNavigator';
import { Block } from '../../Block';

const screen: blessed.Widgets.Screen = {
  cleanSides: null,
  options: null,
  program: null,
  smartCSR: null,
  fastCSR: null,
  useBCE: null,
  resizeTimeout: null,
  tabSize: null,
  autoPadding: null,
  cursor: null,
  dump: null,
  ignoreLocked: null,
  ignoreDockContrast: null,
  dockBorders: null,
  fullUnicode: null,
  sendFocus: null,
  warnings: null,
  forceUnicode: null,
  input: null,
  output: null,
  tput: null,
  focused: null,
  width: null,
  height: null,
  cols: null,
  rows: null,
  top: null,
  left: null,
  right: null,
  bottom: null,
  atop: null,
  aleft: null,
  aright: null,
  abottom: null,
  grabKeys: null,
  lockKeys: null,
  hover: null,
  terminal: null,
  title: null,
  log: null,
  debug: null,
  alloc: null,
  realloc: null,
  draw: null,
  render: jest.fn(),
  clearRegion: null,
  fillRegion: null,
  focusOffset: null,
  focusPrevious: null,
  focusNext: null,
  focusPush: null,
  focusPop: null,
  saveFocus: null,
  restoreFocus: null,
  rewindFocus: null,
  spawn: null,
  exec: null,
  readEditor: null,
  setEffects: null,
  insertLine: null,
  deleteLine: null,
  insertBottom: null,
  insertTop: null,
  deleteBottom: null,
  deleteTop: null,
  enableMouse: null,
  enableKeys: null,
  enableInput: null,
  copyToClipboard: null,
  cursorShape: null,
  cursorColor: null,
  cursorReset: null,
  screenshot: null,
  destroy: null,
  setTerminal: null,
  key: jest.fn(),
  onceKey: null,
  unkey: null,
  removeKey: null,
  on: null,
  focusable: null,
  data: null,
  _: null,
  $: null,
  type: null,
  index: null,
  screen: null,
  parent: null,
  children: null,
  prepend: null,
  append: jest.fn(),
  remove: null,
  insert: null,
  insertBefore: null,
  insertAfter: null,
  detach: null,
  free: null,
  forDescendants: null,
  forAncestors: null,
  collectDescendants: null,
  collectAncestors: null,
  emitDescendants: null,
  emitAncestors: null,
  hasDescendant: null,
  hasAncestor: null,
  get: null,
  set: null,
  addListener: null,
  once: null,
  prependListener: null,
  prependOnceListener: null,
  removeListener: null,
  removeAllListeners: null,
  setMaxListeners: null,
  getMaxListeners: null,
  listeners: null,
  emit: null,
  eventNames: null,
  listenerCount: null,
};

const display: blessed.Widgets.BoxElement = {
  options: null,
  childBase: null,
  childOffset: null,
  scroll: null,
  scrollTo: jest.fn(),
  setScroll: jest.fn(),
  setScrollPerc: jest.fn(),
  getScroll: jest.fn(),
  getScrollHeight: jest.fn(),
  getScrollPerc: jest.fn(),
  resetScroll: jest.fn(),
  on: null,
  name: null,
  border: null,
  style: null,
  position: null,
  content: null,
  hidden: null,
  visible: null,
  detached: null,
  bg: null,
  fg: null,
  bold: null,
  underline: null,
  width: null,
  height: null,
  top: null,
  left: null,
  right: null,
  bottom: null,
  atop: null,
  aleft: null,
  aright: null,
  abottom: null,
  draggable: null,
  itop: null,
  ileft: null,
  iheight: null,
  iwidth: null,
  rtop: null,
  rleft: null,
  rright: null,
  rbottom: null,
  lpos: null,
  render: null,
  hide: null,
  show: null,
  toggle: null,
  focus: null,
  onScreenEvent: null,
  removeScreenEvent: null,
  free: null,
  destroy: null,
  setIndex: null,
  setFront: null,
  setBack: null,
  setLabel: null,
  removeLabel: null,
  setHover: null,
  removeHover: null,
  enableMouse: null,
  enableKeys: null,
  enableInput: null,
  enableDrag: null,
  disableDrag: null,
  screenshot: null,
  setContent: jest.fn(),
  getContent: null,
  setText: null,
  getText: null,
  insertLine: null,
  deleteLine: null,
  getLine: null,
  getBaseLine: null,
  setLine: null,
  setBaseLine: null,
  clearLine: null,
  clearBaseLine: null,
  insertTop: null,
  insertBottom: null,
  deleteTop: null,
  deleteBottom: null,
  unshiftLine: null,
  shiftLine: null,
  pushLine: null,
  popLine: null,
  getLines: null,
  getScreenLines: null,
  strWidth: null,
  key: null,
  onceKey: null,
  unkey: null,
  removeKey: null,
  focusable: null,
  data: null,
  _: null,
  $: null,
  type: null,
  index: null,
  screen: null,
  parent: null,
  children: null,
  prepend: null,
  append: null,
  remove: null,
  insert: null,
  insertBefore: null,
  insertAfter: null,
  detach: null,
  forDescendants: null,
  forAncestors: null,
  collectDescendants: null,
  collectAncestors: null,
  emitDescendants: null,
  emitAncestors: null,
  hasDescendant: null,
  hasAncestor: null,
  get: null,
  set: null,
  addListener: null,
  once: null,
  prependListener: null,
  prependOnceListener: null,
  removeListener: null,
  removeAllListeners: null,
  setMaxListeners: null,
  getMaxListeners: null,
  listeners: null,
  emit: null,
  eventNames: null,
  listenerCount: null,
};

describe('GiltNavigator', () => {
  test('selects first block when navigating to and removing all other blocks', () => {
    const navigator = new GiltNavigator(screen, display);
    const testContent = `block1
content1.1
content1.2

block2
content2.1
content2.2

block3
content3.1
content3.2
`;
    const testBlocks: Block[] = [];
    testContent.replace(/(block\d+)/g, (_, block, offset) => {
      testBlocks.push({ block, offset, valid: true });
      return '';
    });

    navigator.setContent(testContent, testBlocks);
    navigator.navigateNext();
    navigator.removeBlock(navigator.selectedBlockIdx);
    navigator.removeBlock(navigator.selectedBlockIdx);

    expect(navigator.selectedBlockIdx).toBe(0);
  });

  test('handles removal of all blocks', () => {
    const navigator = new GiltNavigator(screen, display);
    const testContent = `block1
content1.1
content1.2

block2
content2.1
content2.2

block3
content3.1
content3.2
`;
    const testBlocks: Block[] = [];
    testContent.replace(/(block\d+)/g, (_, block, offset) => {
      testBlocks.push({ block, offset, valid: true });
      return '';
    });

    navigator.setContent(testContent, testBlocks);
    navigator.removeBlock(navigator.selectedBlockIdx);
    navigator.removeBlock(navigator.selectedBlockIdx);
    navigator.removeBlock(navigator.selectedBlockIdx);

    expect(navigator.navigationBlocks.length).toBe(0);
  });
});
