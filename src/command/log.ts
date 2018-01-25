import { spawnSync } from 'child_process';
import { parseHashes, highlightSelection, calculateScrollDistance } from '../util/parsing';
import * as blessed from 'blessed';

export const logParser = command => {
  const program = (blessed as any).program();
  const { screen, box, escape } = blessed;

  const { stdout, stderr } = spawnSync('git', [
    '-c',
    'color.ui=always',
    command,
  ]);

  const gilt = screen();
  const display = box({
    tags: true,
    scrollable: true,
  });

  gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));

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
        const scrollDistance = calculateScrollDistance(
          initialContent,
          hashes[selectedHash].offset,
          hashes[selectedHash + 1].offset,
        );

        scrolledLines += scrollDistance;
        selectedHash++;

        display.setContent(
          highlightSelection(initialContent, hashes[selectedHash].offset),
        );

        while (
          // 5 line buffer for scrolling
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
        const scrollDistance = calculateScrollDistance(
          initialContent,
          hashes[selectedHash - 1].offset,
          hashes[selectedHash].offset,
        );
        scrolledLines -= scrollDistance;
        selectedHash--;
        display.setContent(
          highlightSelection(initialContent, hashes[selectedHash].offset),
        );

        while (
          scrolledLines < +display.getScroll() + 5 &&
          display.getScroll() > 0
        ) {
          display.scroll(-1 * scrollDistance);
        }
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
};

