import { screen, box } from 'blessed';
// import { spawn } from 'child-process-promise';
import { spawnSync } from 'child_process';

async function run() {
  const gilt = screen();
  const display = box({
    tags: true
  });

  gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));

  const { stdout } = spawnSync('git', ['log']);
  const initialContent = stdout.toString();
  let { match, offset, content } = parseHash(initialContent);
  display.setContent(content);

  gilt.key(['j', 'down'], () => {
    ({ match, offset, content } = parseHash(initialContent, offset));

    display.setContent(content);
    gilt.render();
  });

  gilt.key(['enter', 'd'], () => {
    gilt.spawn('git', ['diff', match], {});
  });

  gilt.append(display);
  gilt.render();
}

if (require.main === module) {
  run();
}

function parseHash(str, startIdx = 0) {
  let foundOffset;
  let foundMatch;
  const content = str.substr(0, startIdx) + str.substr(startIdx).replace(/\b[0-9a-f]{5,40}\b/, (match, offset) => {
    foundMatch = match;
    foundOffset = offset + match.length;
    return `{white-bg}${match}{/}`;
  });

  return {
    match: foundMatch,
    offset: foundOffset,
    content,
  };
}
