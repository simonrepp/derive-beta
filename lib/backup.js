const path = require('path'),
      { spawn } = require('child_process');

const { loadPlain } = require('../derive-common/util.js');

module.exports = async data => {
  const config = await loadPlain(data.root, '.config.plain');
  const backupConfig = config['backup.derive.at'];
  const keyfilePath = path.join(data.root, '.ssh/id_rsa');
  const today = new Date().toISOString().substr(0, 10);
  const backupDir = path.join(backupConfig.directory, today, '/');

  return new Promise((resolve, reject) => {
    const rsync = spawn(
      'rsync',
      [
        '-avz',
        '--delete',
        path.join(data.root, '/'),
        '-e', `ssh -i ${keyfilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`,
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
};
