const FtpDeploy = require('ftp-deploy'),
      ftpSync = require('ftpsync'),
      path = require('path'),
      { spawn } = require('child_process');

const { loadPlain } = require('../derive-common/util.js');

const syncViaFtpDeploy = (data, siteConfig) => {
  return new Promise((resolve, reject) => {
    const ftpDeploy = new FtpDeploy();
    const config = {
      username: siteConfig.ftp.user,
      password: siteConfig.ftp.password,
      host: siteConfig.ftp.host,
      port: 21,
      localRoot: data.buildDir,
      remoteRoot: siteConfig.ftp.directory,
      exclude: ['.htaccess']
      // include: ['build/version.txt'],
    };

    try {
      ftpDeploy.deploy(config, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch(err) {
      reject(err);
    }
  });
};

const syncViaFtpsync = (data, siteConfig) => {
  return new Promise((resolve, reject) => {
    ftpSync.settings = {
      host: siteConfig.ftp.host,
      local: data.buildDir,
      pass: siteConfig.ftp.password,
      remote: siteConfig.ftp.directory,
      user: siteConfig.ftp.user
    };

    try {
      ftpSync.run((err, result) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch(err) {
      reject(err);
    }
  });
};

const syncViaRsync = async (data, siteConfig) => {
  return new Promise((resolve, reject) => {
    const keyfilePath = path.join(data.root, '.ssh/id_rsa');

    const rsync = spawn(
      'rsync',
      [
        '-avz',
        '--delete',
        path.join(data.buildDir, '/'),
        '-e', `ssh -i ${keyfilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`,
        `${siteConfig.ssh.user}@${siteConfig.ssh.host}:${siteConfig.ssh.directory}`
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

module.exports = async (data, site) => {
  const config = await loadPlain(data.root, '.config.plain');
  const siteConfig = config[site];

  try {
    await syncViaRsync(data, siteConfig);
    return;
  } catch(err) {
    atom.notifications.addWarning(
      'Aktualisieren der Seite via rsync ist fehlgeschlagen, ein alternativer Versuch via ftpsync wird gestartet.',
      { detail: err }
    );
  }

  try {
    await syncViaFtpsync(data, siteConfig);
    return;
  } catch(err) {
    atom.notifications.addWarning(
      'Aktualisieren der Seite via ftpsync ist fehlgeschlagen, ein alternativer Versuch via ftp-deploy wird gestartet.',
      { detail: err }
    );
  }

  try {
    await syncViaFtpDeploy(data, siteConfig);
    return;
  } catch(err) {
    throw(err);
  }
};
