const fsExtra = require('fs-extra');
const path = require('path');
const sass = require('sass');   // TODO: sass update from 1.6.2 to 1.9.0 breaks building, check back later with even higher version step if problem gone again
                                //       (For the time being the version has been locked to 1.6.2 in package.json)
const uglifyEs = require('uglify-es');

const { loadFile, writeFile } = require('../derive-common/util.js'),
      index = require('./index.js'),
      writeDirectories = require('./write-directories.js'),
      writeMedia = require('./write-media.js'),
      writePages = require('./write-pages.js');

const compileJs = async data => {
  const scroll = await loadFile(path.join(__dirname, 'scripts/scroll.js'));
  const search = await loadFile(path.join(__dirname, 'scripts/search.js'));
  const sidebar = await loadFile(path.join(__dirname, 'scripts/sidebar.js'));
  const turbolinks = await loadFile(path.join(__dirname, 'scripts/turbolinks.js'));

  const result = uglifyEs.minify({
    'scroll.js': scroll,
    'search.js': search,
    'sidebar.js': sidebar,
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
  await Promise.all([
    compileJs(data),
    compileSass(data),
    fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir),
    writePages(data)
  ]);
  console.timeEnd('writePages');

  console.time('index');
  await index(data);
  console.timeEnd('index');

  console.timeEnd('build');
};
