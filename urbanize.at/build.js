const fsExtra = require('fs-extra');
const path = require('path');
const sass = require('sass');
const uglifyEs = require('uglify-es');

const index = require('./index.js');
const { loadFile, writeFile } = require('../derive-common/util.js');
const writeDirectories = require('./write-directories.js');
const writeMedia = require('./write-media.js');
const writePages = require('./write-pages.js');

const compileJs = async data => {
  const fuse = await loadFile(path.join(__dirname, 'scripts/fuse.min.js'));
  const moment = await loadFile(path.join(__dirname, 'scripts/moment-with-locales.js'));
  const search = await loadFile(path.join(__dirname, 'scripts/search.js'));
  const turbolinks = await loadFile(path.join(__dirname, 'scripts/turbolinks.js'));

  const result = uglifyEs.minify({
    'fuse.min.js': fuse,
    'moment-with-locales.js': moment,
    'search.js': search,
    'turbolinks.js': turbolinks
  });

  if(result.error) {
    console.log(result.error);
  } else {
    await writeFile(data.buildDir, 'bundle.js', result.code);
  }
};

const compileSass = data => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.join(__dirname, 'styles/main.scss'),
      outputStyle: 'compressed',
    }, (err, result) => {
      if(err) {
        reject(err);
      } else {
        writeFile(data.buildDir, 'styles.css', result.css).then(resolve);
      }
    });
  });
};

module.exports = async (data, city, options = { preview: false }) => {
  console.time('build');

  const urbanize = data.urbanize[city];
  
  urbanize.assetHash = (new Date()).getTime().toString();

  console.time('writeDirectories');
  await writeDirectories(data, urbanize);
  console.timeEnd('writeDirectories');

  console.time('writeMedia');
  await writeMedia(data, urbanize, options.preview);
  console.timeEnd('writeMedia');

  console.time('writePages');
  await Promise.all([
    compileJs(data),
    compileSass(data),
    fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir),
    writePages(data, urbanize)
  ]);
  console.timeEnd('writePages');

  console.time('index');
  await index(data, urbanize);
  console.timeEnd('index');

  console.timeEnd('build');
};
