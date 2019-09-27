const fsExtra = require('fs-extra');
const path = require('path');

const { loadFile, writeFile } = require('../derive-common/util.js');
const writeDirectories = require('./write-directories.js');
const writeMedia = require('./write-media.js');
const writePages = require('./write-pages.js');

module.exports = async (data, site, options = { preview: false }) => {
  console.time('build');

  // TODO: Don't pass data.urbanize down (now it's static), resolve further down in modules
  data.urbanize.base_url = `https://${site}`;
  data.urbanize.assetHash = (new Date()).getTime().toString();

  console.time('writeDirectories');
  await writeDirectories(data);
  console.timeEnd('writeDirectories');

  console.time('writeMedia');
  await writeMedia(data, data.urbanize, options.preview);
  console.timeEnd('writeMedia');

  console.time('writePages');
  await fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir),
  await writePages(data);
  console.timeEnd('writePages');

  console.timeEnd('build');
};
