const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

// TODO: Only write published && visible dirs, pages, media!

module.exports = async data => {

  const copy = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return fsExtra.copy(fromAbsolute, toAbsolute);
  };

  const copyResized = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return sharp(fromAbsolute).resize(960, 960)
                              .max()
                              .withoutEnlargement()
                              .toFile(toAbsolute);
  };

  const concurrentWrites = [];

  // TODO: In addition to the !written check, each media should also be stats()'ed and
  //       the results compared against cached stats, if mTime or size differ we rewrite.
  //       We might also want to include a ?3350350530 postfix to the written url to
  //       invalidate the browser cache
  //       (re stat check, we could possibly do this in connectMedia too)
  //
  //       if(article.image && !article.image.written) ... what we used but does not work like that

  for(let article of data.visibleArticles) {
    if(article.image) {
      const finalPath = path.join('/texte', article.permalink, `bild${path.extname(article.image.connected)}`);
      article.image.written = finalPath;

      concurrentWrites.push( copyResized(article.image.connected, finalPath) );
    }

    if(article.text) {
      let written = article.text.connected;

      for(let [originalFilePath, replacedFilePath] of article.text.downloads) {
        const finalPath = path.join('/texte', article.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copy(originalFilePath, finalPath) );
      }

      for(let [originalFilePath, replacedFilePath] of article.text.embeds) {
        const finalPath = path.join('/texte', article.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copyResized(originalFilePath, finalPath) );
      }

      article.text.written = written;
    }
  }

  for(let book of data.books.values()) {
    if(book.cover) {
      const finalPath = path.join('/bücher', book.permalink, `cover${path.extname(book.cover.connected)}`);
      book.cover.written = finalPath;

      concurrentWrites.push( copyResized(book.cover.connected, finalPath) );
    }
  }

  for(let event of data.events.values()) {
    if(event.image) {
      const finalPath = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.connected)}`);
      event.image.written = finalPath;

      concurrentWrites.push( copyResized(event.image.connected, finalPath) );
    }

    if(event.text) {
      let written = event.text.connected;

      for(let [originalFilePath, replacedFilePath] of event.text.downloads) {
        const finalPath = path.join('/veranstaltungen', event.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copy(originalFilePath, finalPath) );
      }

      for(let [originalFilePath, replacedFilePath] of event.text.embeds) {
        const finalPath = path.join('/veranstaltungen', event.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copyResized(originalFilePath, finalPath) );
      }

      event.text.written = written;
    }
  }

  for(let issue of data.issues.values()) {
    if(issue.cover) {
      const finalPath = path.join('/zeitschrift', issue.number.toString(), `cover${path.extname(issue.cover.connected)}`);
      issue.cover.written = finalPath;

      concurrentWrites.push( copyResized(issue.cover.connected, finalPath) );
    }
  }

  // TODO: So far not yet clear how this ties in with the derive.at page
  //       Weigh off usage of this vs. special .plain files
  //       (but prefer pages when possible because they are generic!)
  // TODO: Also consider urls - maybe have this be unprefixed (no seiten/)
  //       but directly - dynamically - in root scope, the allowed permalinks
  //       are then enforced by a WHITELIST written by me, enforced on crossvalidate
  // for(let page of data.pages.values()) {
  //   if(page.urbanize === null && page.text) {
  //     let written = page.text.connected;
  //
  //     for(let [originalFilePath, replacedFilePath] of page.text.downloads) {
  //       const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
  //       written = written.replace(replacedFilePath, finalPath);

  //       concurrentWrites.push( copy(originalFilePath, finalPath) );
  //     }
  //
  //     for(let [originalFilePath, replacedFilePath] of page.text.embeds) {
  //       const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
  //       written = written.replace(replacedFilePath, finalPath);

  //       concurrentWrites.push( copyResized(originalFilePath, finalPath) );
  //     }
  //
  //     page.text.written = written;
  //   }
  // }

  for(let program of data.programs.values()) {
    if(program.image) {
      const finalPath = path.join('/radio', program.permalink, `bild${path.extname(program.image.connected)}`);
      program.image.written = finalPath;

      concurrentWrites.push( copyResized(program.image.connected, finalPath) );
    }

    if(program.soundfile) {
      const finalPath = path.join('/radio', program.permalink, `aufnahme${path.extname(program.soundfile.connected)}`);
      program.soundfile.written = finalPath;

      concurrentWrites.push( copy(program.soundfile.connected, finalPath) );
    }

    if(program.text) {
      let written = program.text.connected;

      for(let [originalFilePath, replacedFilePath] of program.text.downloads) {
        const finalPath = path.join('/radio', program.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copy(originalFilePath, finalPath) );
      }

      for(let [originalFilePath, replacedFilePath] of program.text.embeds) {
        const finalPath = path.join('/radio', program.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);

        concurrentWrites.push( copyResized(originalFilePath, finalPath) );
      }

      program.text.written = written;
    }
  }

  await Promise.all(concurrentWrites);
};
