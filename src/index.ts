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

  const { stdout, stderr } = spawnSync('git', [
    '-c',
    'color.ui=always',
    ...process.argv.slice(2),
  ]);

  const initialContent = escape(stdout.toString()) + '\n\n';

  const error = stderr.toString();

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const hashes = parseHashes(initialContent);
  let selectedHash = 0;

  display.setContent(highlightSelection(initialContent, hashes[0].offset));

  if (hashes.length > 1) {
    let scrolledLines = 0;

    gilt.key(['j', 'down'], () => {
      if (selectedHash < hashes.length - 1) {
        const scrollDistance = (
          initialContent
            .substring(
              hashes[selectedHash].offset,
              hashes[selectedHash + 1].offset,
            )
            .match(/\n/g) || []
        ).length;

        scrolledLines += scrollDistance;
        selectedHash++;

        display.setContent(
          highlightSelection(initialContent, hashes[selectedHash].offset),
        );

        while (
          scrolledLines > +display.getScroll() - 5 &&
          +display.getScroll() < +display.getScrollHeight()
        ) {
          display.scroll(scrollDistance);
        }
        gilt.render();
      }
    });

    gilt.key(['k', 'up'], () => {
      if (selectedHash > 0) {
        const scrollDistance = (
          initialContent
            .substring(
              hashes[selectedHash - 1].offset,
              hashes[selectedHash].offset,
            )
            .match(/\n/g) || []
        ).length;
        scrolledLines -= scrollDistance;
        selectedHash--;

        while (
          scrolledLines < +display.getScroll() + 5 &&
          display.getScroll() > 0
        ) {
          display.scroll(-1 * scrollDistance);
        }
        display.setContent(
          highlightSelection(initialContent, hashes[selectedHash].offset),
        );
        gilt.render();
      }
    });
  }

  gilt.key(['enter', 'd'], () => {
    program.clear();
    gilt.spawn(
      'git',
      ['-c', 'core.pager=less -+F', 'show', '-w', hashes[selectedHash].hash],
      {},
    );
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
  str.replace(/(?:\b|\d\dm)([0-9a-f]{5,40})\b/g, (_, match, offset) => {
    hashes.push({ hash: match, offset });
  });

  return hashes;
}

function highlightSelection(str, offset = 0) {
  return (
    str.substr(0, offset) +
    str
      .substr(offset)
      .replace(/(\b|\d\dm)([0-9a-f]{5,40})\b/, '$1{white-bg}$2{/}')
  );
}
