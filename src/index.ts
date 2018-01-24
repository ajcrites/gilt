#!/usr/bin/env node
import * as blessed from 'blessed';
import { spawnSync } from 'child_process';

const program = (blessed as any).program();
const { screen, box, list, escape } = blessed;

async function run() {
  const gilt = screen();
  const display = box({
    tags: true,
    scrollable: true,
  });

  gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));

  const { stdout } = spawnSync('git', ['-c', 'color.ui=always', 'log']);
  // const { stdout } = spawnSync('git', ['blame', 'src/index.ts']);
  const initialContent = escape(stdout.toString()) + '\n\n';
  const hashes = parseHashes(initialContent);
  let selectedHash = 0;

  display.setContent(highlightSelection(initialContent, hashes[0].offset));

  const guessLines = initialContent.substr(hashes[0].offset, hashes[1].offset).match(/\n/g).length;

  gilt.key(['j', 'down'], () => {
    if (selectedHash < hashes.length) {
      selectedHash++;

      display.setContent(highlightSelection(initialContent, hashes[selectedHash].offset));
      while (selectedHash * guessLines > +display.getScroll() - 5 && +display.getScroll() < +display.getScrollHeight()) {
        display.scroll(guessLines);
      }
      gilt.render();
    }
  });

  gilt.key(['k', 'up'], () => {
    if (selectedHash > 0) {
      selectedHash--;

      while (selectedHash * guessLines < +display.getScroll() + 5 && display.getScroll() > 0) {
        display.scroll(-1 * guessLines);
      }
      display.setContent(highlightSelection(initialContent, hashes[selectedHash].offset));
      gilt.render();
    }
  });

  gilt.key(['enter', 'd'], () => {
    program.clear();
    gilt.spawn('git', ['diff', '-w', hashes[selectedHash].hash], {});
  });

  gilt.key(['c'], () => {
    gilt.spawn('git', ['checkout', hashes[selectedHash].hash], {});
    process.exit();
  });

  gilt.append(display);
  gilt.render();
}

if (require.main === module) {
  run();
}

function parseHashes(str) {
  const hashes = [];
  str.replace(/\b[0-9a-f]{5,40}\b/g, (match, offset) => {
    hashes.push({ hash: match, offset });
  });

  return hashes;
}

function highlightSelection(str, offset = 0) {
  return (
    str.substr(0, offset) +
    str.substr(offset).replace(/\b[0-9a-f]{5,40}\b/, '{white-bg}$&{/}')
  );
}
