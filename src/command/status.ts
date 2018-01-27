import { spawnSync } from 'child_process';
import { parseFiles, highlightString, calculateScrollDistance } from '../util/parsing';
import * as blessed from 'blessed';

export const statusParser = command => {
  const program = (blessed as any).program();
  const { screen, box, escape } = blessed;

  const { stdout, stderr } = spawnSync('git', [
    '-c',
    'color.ui=always',
    ...command,
  ]);

  const gilt = (screen as any)({
    debug: true,
  });
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

  const files = parseFiles(initialContent);
  let selectedFile = 0;

  // No available log output (or no hashes to navigate) so we simply exit
  if (!files.length) {
    console.log(initialContent);
    process.exit();
  }

  display.setContent(highlightString(initialContent, files[0].file, files[0].offset));

  if (files.length > 1) {
    let scrolledLines = 0;

    gilt.key(['j', 'down'], () => {
      if (selectedFile < files.length - 1) {
        const scrollDistance = calculateScrollDistance(
          initialContent,
          files[selectedFile].offset,
          files[selectedFile + 1].offset,
        );

        scrolledLines += scrollDistance;
        selectedFile++;

        gilt.debug(files[selectedFile].file);
        display.setContent(
          highlightString(initialContent, files[selectedFile].file, files[selectedFile].offset),
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
      if (selectedFile > 0) {
        const scrollDistance = calculateScrollDistance(
          initialContent,
          files[selectedFile - 1].offset,
          files[selectedFile].offset,
        );
        scrolledLines -= scrollDistance;
        selectedFile--;
        display.setContent(
          highlightString(initialContent, files[selectedFile].file, files[selectedFile].offset),
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

  gilt.key(['enter', 'e'], () => {
    program.clear();
    gilt.spawn(
      process.env.EDITOR,
      [files[selectedFile].file],
      {},
    );
  });

  gilt.append(display);
  gilt.render();
};

