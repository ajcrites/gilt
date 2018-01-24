import { screen, box } from 'blessed';
// import { spawn } from 'child-process-promise';
import { spawnSync } from 'child_process';

async function run() {
  const gilt = screen();
  const display = box({
    tags: true,
  });

  gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));

  // const { stdout } = spawnSync('git', ['log']);
  const { stdout } = spawnSync('git', ['blame', 'src/index.ts']);
  const initialContent = stdout.toString();
  const hashes = parseHashes(initialContent);
  let selectedHash = 0;

  display.setContent(highlightSelection(initialContent, hashes[0].offset));

  gilt.key(['j', 'down'], () => {
    if (selectedHash < hashes.length) {
      selectedHash++;

      display.setContent(highlightSelection(initialContent, hashes[selectedHash].offset));
      gilt.render();
    }
  });

  gilt.key(['k', 'up'], () => {
    if (selectedHash > 0) {
      selectedHash--;

      display.setContent(highlightSelection(initialContent, hashes[selectedHash].offset));
      gilt.render();
    }
  });

  gilt.key(['enter', 'd'], () => {
    gilt.spawn('git', ['diff', hashes[selectedHash].hash], {});
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
