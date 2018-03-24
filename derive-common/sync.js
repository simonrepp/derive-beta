const path = require('path'),
      { spawn } = require('child_process');

const { loadToml } = require('./lib.js');

module.exports = async (data, site) => {
  const config = await loadToml(data.root, '.config.toml');

  return new Promise((resolve, reject) => {
    const keyfilePath = path.join(data.root, '.ssh/id_rsa');

    // TODO: Possibly "ssh -o StrictHostKeyChecking=no username@hostname.com", see https://serverfault.com/questions/132970/can-i-automatically-add-a-new-host-to-known-hosts
    const rsync = spawn(
      'rsync',
      [
        '-avz',
        '--delete',
        path.join(data.buildDir, '/'),
        '-e', `ssh -i ${keyfilePath}`,
        `${config.user}@${config.host}:${config.directory[site]}`
      ]
    );

    rsync.stdout.on('data', data => { console.log(data.toString()) });
    rsync.stderr.on('data', data => { console.log(data.toString()) });

    rsync.on('close', (code, signal) => {
      if(code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
