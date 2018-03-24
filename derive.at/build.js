const fsExtra = require('fs-extra'),
      path = require('path'),
      sass = require('sass'),
      uglifyEs = require('uglify-es');

const { loadFile, writeFile } = require('../derive-common/lib.js'),
      postprocess = require('./postprocess.js'),
      write = require('./write.js');

const compileJs = async data => {
  const scroll = await loadFile(path.join(__dirname, 'src/scripts/scroll.js'));
  const sidebar = await loadFile(path.join(__dirname, 'src/scripts/sidebar.js'));
  const turbolinks = await loadFile(path.join(__dirname, 'src/scripts/turbolinks.js'));

  const result = uglifyEs.minify({
    'scroll.js': scroll,
    'sidebar.js': sidebar,
    'turbolinks.js': turbolinks
  });

  if(result.error) {
    console.log(result.error);
  } else {
    await writeFile(path.join(data.buildDir, 'bundle.js'), result.code);
  }
};

const compileSass = data => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.join(__dirname, 'src/styles/main.scss'),
      outputStyle: 'compressed',
    }, (err, result) => {
      if(err) {
        reject(err);
      } else {
        writeFile(path.join(data.buildDir, 'styles.css'), result.css).then(resolve);
      }
    });
  });
};

module.exports = async data => {
  try {
    console.time('build time');

    await fsExtra.emptyDir(data.buildDir);

    // TODO: await postprocess(data); >>> consider folder structure requirements (what already exists when ? etc.)

    // await write(data); // TODO: All these reintegrate please
    // await index(data);
    // await suggestions(data);
    // await postprocess(data); // TODO: Rewrite media paths from backend layout to web-facing layout and naming everywhere

    await Promise.all([
      compileJs(data),
      compileSass(data),
      fsExtra.copy(path.join(__dirname, 'static/'), data.buildDir),
      write(data)
    ]);

    console.timeEnd('build time');
  } catch(err) {
    console.log(err);
  }
};
