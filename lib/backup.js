const path = require('path'),
      { spawn } = require('child_process');

module.exports = data => new Promise((resolve, reject) => {
  const backupConfig = data.config['backup.derive.at'];
  const today = new Date().toISOString().substr(0, 10);
  const backupDir = path.join(backupConfig.directory, today, '/');

  const rsync = spawn(
    'rsync',
    [
      '-avz',
      '--delete',
      path.join(data.root, '/'),
      '-e', `ssh -o StrictHostKeyChecking=no`,
      `${backupConfig.user}@${backupConfig.host}:${backupDir}`
    ]
  );

  rsync.stdout.on('data', data => { console.log(data.toString()) });
  rsync.stderr.on('data', data => { console.log(data.toString()) });

  rsync.on('close', (code, signal) => {
    data.backupProcess = null;

    if(code === 0) {
      resolve();
    } else {
      reject();
    }
  });

  data.backupProcess = rsync;
});
