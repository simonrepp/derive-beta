const fsExtra = require('fs-extra');

const { createDir } = require('../derive-common/util.js');

module.exports = async data => {
  await fsExtra.emptyDir(data.buildDir);

  const directories = [
    'beteiligte',
    'programm',
    'seite-nicht-gefunden',
    ...Object.values(data.urbanize.events).map(event => event.permalink),
    ...Object.values(data.urbanize.pages).map(page => page.permalink),
    ...data.urbanize.participants.map(participant => participant.permalink)
  ];

  await Promise.all(directories.map(dir => createDir(data.buildDir, dir)));
};
