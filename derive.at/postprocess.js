const fsExtra = require('fs-extra'), // TODO: ideally substitute fsExtra with graceful-fs everywhere ? NOPE replace graceful-fs with fs and code in a not too async way!
      sharp = require('sharp');

module.exports = async data => {
  await Promise.all(data.articles.filter(article => article.image).map(async article => {
    const sourcePath = path.join(data.root, article.image);
    const targetPath = path.join(data.buildDir, article.image);

    await fsExtra.ensureDir(path.dirname(targetPath));

    await sharp(sourcePath).resize(620, 620)
                           .max()
                           .withoutEnlargement()
                           .toFile(targetPath);
  }));

  await Promise.all(data.books.filter(book => book.image).map(async book => {
    const sourcePath = path.join(data.root, book.image);
    const targetPath = path.join(data.buildDir, book.image);

    await fsExtra.ensureDir(path.dirname(targetPath));
    await sharp(sourcePath).resize(620, 620)
                           .max()
                           .withoutEnlargement()
                           .toFile(targetPath);
  }));

  await Promise.all(data.events.filter(event => event.image).map(async event => {
    const sourcePath = path.join(data.root, event.image);
    const targetPath = path.join(data.buildDir, event.image);

    await fsExtra.ensureDir(path.dirname(targetPath));
    await sharp(sourcePath).resize(620, 620)
                           .max()
                           .withoutEnlargement()
                           .toFile(targetPath);
  }));

  await Promise.all(data.issues.filter(issue => issue.cover).map(async issue => {
    const sourcePath = path.join(data.root, issue.cover);
    const targetPath = path.join('public', issue.cover);

    await fsExtra.ensureDir(path.dirname(targetPath));
    await sharp(sourcePath).resize(620, 620)
                           .max()
                           .withoutEnlargement()
                           .toFile(targetPath);
  }));

  await Promise.all(data.programs.map(async program => {
    if(program.image) {
      const sourcePath = path.join(data.root, program.image);
      const targetPath = path.join('public', 'radio', program.permalink, path.basename(program.image));

      await fsExtra.ensureDir(path.dirname(targetPath));
      await sharp(sourcePath).resize(620, 620)
                             .max()
                             .withoutEnlargement()
                             .toFile(targetPath);
    }

    if(program.soundfile) {
      const sourcePath = path.join(data.root, program.soundfile);
      const targetPath = path.join('public', 'radio', program.permalink, `aufnahme${path.extname(program.soundfile)}`);

      await fsExtra.ensureDir(path.dirname(targetPath));
      await fsExtra.copy(sourcePath, targetPath);
    }
  }));

};
