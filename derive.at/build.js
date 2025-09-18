const fsExtra = require('fs-extra');
const path = require('path');

const index = require('./index.js');
const writeDirectories = require('./write-directories.js');
const writeMedia = require('./write-media.js');
const writePages = require('./write-pages.js');
const writeStyles = require('./write-styles.js');

module.exports = async (data, options = { preview: false }) => {
  console.time('build');

  data.assetHash = (new Date()).getTime().toString();

  console.time('writeDirectories');
  writeDirectories(data);
  console.timeEnd('writeDirectories');

  console.time('writeMedia');
  await writeMedia(data, options.preview);
  console.timeEnd('writeMedia');

  console.time('writeStyles');
  await writeStyles(data);
  console.timeEnd('writeStyles')

  console.time('writePages');
  fsExtra.copySync(path.join(__dirname, 'static/'), data.buildDir);
  writePages(data);
  console.timeEnd('writePages');

  console.time('index');
  index(data);
  console.timeEnd('index');

  console.timeEnd('build');
};
