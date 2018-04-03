const path = require('path'),
      { spawn } = require('child_process');

module.exports = (data, site) => new Promise((resolve, reject) => {
  const siteConfig = data.config[site];

  try {
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
  } catch(err) {
    atom.notifications.addWarning(
      'Aktualisieren der Seite via rsync ist fehlgeschlagen.',
      { detail: err }
    );
  }
});
