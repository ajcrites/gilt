import { screen, box } from 'blessed';
// import { spawn } from 'child-process-promise';
import { spawnSync } from 'child_process';

async function run() {
  const gilt = screen();
  const content = box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
  });

  gilt.title = 'Hello!';
  gilt.key(['escape', 'q', 'C-c'], () => process.exit(0));

  const { stderr }  = spawnSync('git', ['log']);
  // content.setContent(stdout.toString());
  console.log(stderr.toString());

  // gilt.append(content);
  // gilt.render();
}

if (require.main === module) {
  run();
}
