const fsExtra = require('fs-extra');
const path = require('path');

const index = require('./index.js');
const { loadFile, writeFile } = require('../derive-common/util.js');
const writeDirectories = require('./write-directories.js');
const writeMedia = require('./write-media.js');
const writePages = require('./write-pages.js');


module.exports = async (data, site, options = { preview: false }) => {
  console.time('build');

  const city = site.includes('berlin') ? 'berlin' : 'wien';
  const urbanize = data.urbanize[city];

  urbanize.base_url = `https://${site}`;
  urbanize.assetHash = (new Date()).getTime().toString();

  console.time('writeDirectories');
  await writeDirectories(data, urbanize);
  console.timeEnd('writeDirectories');

  console.time('writeMedia');
  await writeMedia(data, urbanize, options.preview);
  console.timeEnd('writeMedia');

  console.time('writePages');
  await fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir),
  await  writePages(data, urbanize)
  console.timeEnd('writePages');

  console.time('index');
  await index(data, urbanize);
  console.timeEnd('index');

  console.timeEnd('build');
};
