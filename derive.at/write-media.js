const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

// TODO: Only write published && visible dirs, pages, media!
// TODO: Rewrite .tiff images to .png, etc.

module.exports = async (data, preview) => {

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

  for(let article of data.visibleArticles) {
    if(article.image) {
      if(preview) {
        article.image.written = `${data.rootServerUrl}/${article.image.sourced}`;
      } else {
        article.image.written = path.join('/texte', article.permalink, `bild${path.extname(article.image.sourced)}`);
        concurrentWrites.push( copyResized(article.image.sourced, article.image.written) );
      }
    }

    if(article.text) {
      if(preview) {
        let written = article.text.sourced;

        for(let [originalFilePath, replacedFilePath] of article.text.downloads) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        for(let [originalFilePath, replacedFilePath] of article.text.embeds) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        article.text.written = written;
      } else {
        let written = article.text.sourced;

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
  }

  for(let book of data.books.values()) {
    if(book.cover) {
      if(preview) {
        book.cover.written = `${data.rootServerUrl}/${book.cover.sourced}`;
      } else {
        book.cover.written = path.join('/bücher', book.permalink, `cover${path.extname(book.cover.sourced)}`);
        concurrentWrites.push( copyResized(book.cover.sourced, book.cover.written) );
      }
    }
  }

  for(let event of data.events.values()) {
    if(event.image) {
      if(preview) {
        event.image.written = `${data.rootServerUrl}/${event.image.sourced}`;
      } else {
        event.image.written = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.sourced)}`);
        concurrentWrites.push( copyResized(event.image.sourced, event.image.written) );
      }
    }

    if(event.text) {
      if(preview) {
        let written = event.text.sourced;

        for(let [originalFilePath, replacedFilePath] of event.text.downloads) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        for(let [originalFilePath, replacedFilePath] of event.text.embeds) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        event.text.written = written;
      } else {
        let written = event.text.sourced;

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
  }

  let imageNumber = 0;
  for(let feature of data.features.values()) {
    if(feature.image) {
      if(preview) {
        feature.image.written = `${data.rootServerUrl}/${feature.image.sourced}`;
      } else {
        feature.image.written = path.join('/features', `bild-${imageNumber++}${path.extname(feature.image.sourced)}`);
        concurrentWrites.push( copyResized(feature.image.sourced, feature.image.written) );
      }
    }
  }

  for(let issue of data.issues.values()) {
    if(issue.cover) {
      if(preview) {
        issue.cover.written = `${data.rootServerUrl}/${issue.cover.sourced}`;
      } else {
        issue.cover.written = path.join('/zeitschrift', issue.number.toString(), `cover${path.extname(issue.cover.sourced)}`);
        concurrentWrites.push( copyResized(issue.cover.sourced, issue.cover.written) );
      }
    }
  }

  // TODO: Also consider urls - maybe have this be unprefixed (no seiten/)
  //       but directly - dynamically - in root scope, the allowed permalinks
  //       are then enforced by a WHITELIST written by me, enforced on crossvalidate
  for(let page of data.pages.values()) {
    if(page.urbanize === null && page.text) {
      if(preview) {
        let written = page.text.sourced;

        for(let [originalFilePath, replacedFilePath] of page.text.downloads) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        for(let [originalFilePath, replacedFilePath] of page.text.embeds) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        page.text.written = written;
      } else {
        let written = page.text.sourced;

        for(let [originalFilePath, replacedFilePath] of page.text.downloads) {
          const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
          written = written.replace(replacedFilePath, finalPath);

          concurrentWrites.push( copy(originalFilePath, finalPath) );
        }

        for(let [originalFilePath, replacedFilePath] of page.text.embeds) {
          const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
          written = written.replace(replacedFilePath, finalPath);

          concurrentWrites.push( copyResized(originalFilePath, finalPath) );
        }

        page.text.written = written;
      }
    }
  }

  for(let program of data.programs.values()) {
    if(program.image) {
      if(preview) {
        program.image.written = `${data.rootServerUrl}/${program.image.sourced}`;
      } else {
        program.image.written = path.join('/radio', program.permalink, `bild${path.extname(program.image.sourced)}`);
        concurrentWrites.push( copyResized(program.image.sourced, program.image.written) );
      }
    }

    if(program.soundfile) {
      if(preview) {
        program.soundfile.written = `${data.rootServerUrl}/${program.soundfile.sourced}`;
      } else {
        program.soundfile.written = path.join('/radio', program.permalink, `aufnahme${path.extname(program.soundfile.sourced)}`);
        concurrentWrites.push( copyResized(program.soundfile.sourced, program.soundfile.written) );
      }
    }

    if(program.text) {
      if(preview) {
        let written = program.text.sourced;

        for(let [originalFilePath, replacedFilePath] of program.text.downloads) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        for(let [originalFilePath, replacedFilePath] of program.text.embeds) {
          const finalPath = `${data.rootServerUrl}/${replacedFilePath}`;
          written = written.replace(replacedFilePath, finalPath);
        }

        program.text.written = written;
      } else {
        let written = program.text.sourced;

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
  }

  await Promise.all(concurrentWrites);
};
