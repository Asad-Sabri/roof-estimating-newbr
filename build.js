const { exec } = require('child_process');

const buildProcess = exec('npm run build');

buildProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

buildProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

buildProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
