const fsExtra = require('fs-extra');
const path = require('path');

const { loadFile, writeFile } = require('../derive-common/util.js');
const index = require('./index.js');
const writeDirectories = require('./write-directories.js');
const writeMedia = require('./write-media.js');
const writePages = require('./write-pages.js');

module.exports = async (data, options = { preview: false }) => {
  console.time('build');

  data.assetHash = (new Date()).getTime().toString();

  console.time('writeDirectories');
  await writeDirectories(data);
  console.timeEnd('writeDirectories');

  console.time('writeMedia');
  await writeMedia(data, options.preview);
  console.timeEnd('writeMedia');

  console.time('writePages');
  await fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir);
  await writePages(data);
  console.timeEnd('writePages');

  console.time('index');
  await index(data);
  console.timeEnd('index');

  console.timeEnd('build');
};
