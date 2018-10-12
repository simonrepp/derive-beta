const path = require('path');
const { spawn } = require('child_process');

module.exports = (data, site) => new Promise((resolve, reject) => {
  const siteConfig = data.config[site];

  try {
    const rsync = spawn(
      'rsync',
      [
        '-avz',
        '--delete',
        path.join(data.buildDir, '/'),
        '-e', 'ssh -o StrictHostKeyChecking=no',
        `${siteConfig.user}@${siteConfig.host}:${siteConfig.directory}`
      ]
    );

    rsync.stdout.on('data', payload => {
      data.pending.details = payload.toString();
    });

    rsync.stderr.on('data', payload => {
      data.pending.details = payload.toString();
    });

    rsync.on('close', code => {
      data.syncProcess = null;
      data.pending.details = null;

      if(code === 0) {
        resolve();
      } else {
        reject();
      }
    });

    data.syncProcess = rsync;
  } catch(err) {
    atom.notifications.addWarning(
      'Aktualisieren der Seite via rsync ist fehlgeschlagen.',
      { detail: err }
    );
  }
});
