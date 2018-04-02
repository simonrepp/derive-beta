const path = require('path'),
      { spawn } = require('child_process');

const { loadPlain } = require('../derive-common/util.js');

const syncViaRsync = async (data, siteConfig) => {
  return new Promise((resolve, reject) => {
    const rsync = spawn(
      'rsync',
      [
        '-avz',
        '--delete',
        path.join(data.buildDir, '/'),
        '-e', `ssh -o StrictHostKeyChecking=no`,
        `${siteConfig.user}@${siteConfig.host}:${siteConfig.directory}`
      ]
    );

    rsync.stdout.on('data', data => { console.log(data.toString()) });
    rsync.stderr.on('data', data => { console.log(data.toString()) });

    rsync.on('close', (code, signal) => {
      data.syncProcess = null;

      if(code === 0) {
        resolve();
      } else {
        reject();
      }
    });

    data.syncProcess = rsync;
  });
};

module.exports = async (data, site) => {
  const config = await loadPlain(data.root, '.config.plain');
  const siteConfig = config[site];

  try {
    await syncViaRsync(data, siteConfig);
    return;
  } catch(err) {
    atom.notifications.addWarning(
      'Aktualisieren der Seite via rsync ist fehlgeschlagen.',
      { detail: err }
    );
  }
};
