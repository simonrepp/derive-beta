const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

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

  for(let article of data.readableArticles) {
    if(article.image) {
      if(preview) {
        article.image.written = encodeURI(`${data.rootServerUrl}/${article.image.localFilesystemPath}`);
      } else {
        article.image.written = path.join('/texte', article.permalink, `bild${path.extname(article.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(article.image.localFilesystemPath, article.image.written) );
      }
    }

    if(article.text) {
      let text = article.text.converted;

      if(preview) {
        for(let download of article.text.downloads) {
          download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of article.text.embeds) {
          embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of article.text.downloads) {
          download.written = path.join('/texte', article.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of article.text.embeds) {
          embed.written = path.join('/texte', article.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      article.text.written = text;
    }
  }

  for(let book of data.books.values()) {
    if(book.cover) {
      if(preview) {
        book.cover.written = encodeURI(`${data.rootServerUrl}/${book.cover.localFilesystemPath}`);
      } else {
        book.cover.written = path.join('/buecher', book.permalink, `cover${path.extname(book.cover.normalizedPath)}`);
        concurrentWrites.push( copyResized(book.cover.localFilesystemPath, book.cover.written) );
      }
    }
  }

  for(let event of data.events.values()) {
    if(event.image) {
      if(preview) {
        event.image.written = encodeURI(`${data.rootServerUrl}/${event.image.localFilesystemPath}`);
      } else {
        event.image.written = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(event.image.localFilesystemPath, event.image.written) );
      }
    }

    if(event.text) {
      let text = event.text.converted;

      if(preview) {
        for(let download of event.text.downloads) {
          download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of event.text.downloads) {
          download.written = path.join('/veranstaltungen', event.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = path.join('/veranstaltungen', event.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      event.text.written = text;
    }
  }

  let featureNumber = 0;
  for(let feature of data.features.values()) {
    if(feature.image) {
      if(preview) {
        feature.image.written = encodeURI(`${data.rootServerUrl}/${feature.image.localFilesystemPath}`);
      } else {
        feature.image.written = path.join('/features', `bild-${featureNumber++}${path.extname(feature.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(feature.image.localFilesystemPath, feature.image.written) );
      }
    }
  }

  let festivalNumber = 0;
  if(preview) {
    data.festival.image.written = encodeURI(`${data.rootServerUrl}/${data.festival.image.localFilesystemPath}`);
  } else {
    data.festival.image.written = path.join('/festival', `bild-${festivalNumber++}${path.extname(data.festival.image.normalizedPath)}`);
    concurrentWrites.push( copyResized(data.festival.image.localFilesystemPath, data.festival.image.written) );
  }
  for(let edition of data.festival.editions) {
    if(preview) {
      edition.image.written = encodeURI(`${data.rootServerUrl}/${edition.image.localFilesystemPath}`);
    } else {
      edition.image.written = path.join('/festival', `bild-${festivalNumber++}${path.extname(edition.image.normalizedPath)}`);
      concurrentWrites.push( copyResized(edition.image.localFilesystemPath, edition.image.written) );
    }
  }

  for(let issue of data.issues.values()) {
    if(issue.cover) {
      if(preview) {
        issue.cover.written = encodeURI(`${data.rootServerUrl}/${issue.cover.localFilesystemPath}`);
      } else {
        issue.cover.written = path.join('/zeitschrift', issue.permalink, `cover${path.extname(issue.cover.normalizedPath)}`);
        concurrentWrites.push( copyResized(issue.cover.localFilesystemPath, issue.cover.written) );
      }
    }
  }

  for(let page of data.derivePages) {
    let text = page.text.converted;

    if(preview) {
      for(let download of page.text.downloads) {
        download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
        text = text.replace(download.placeholder, download.written);
      }

      for(let embed of page.text.embeds) {
        embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
        text = text.replace(embed.placeholder, embed.written);
      }
    } else {
      for(let download of page.text.downloads) {
        download.written = path.join('/', page.permalink, `text-${download.virtualFilename}`);
        concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

        text = text.replace(download.placeholder, download.written);
      }

      for(let embed of page.text.embeds) {
        embed.written = path.join('/', page.permalink, `text-${embed.virtualFilename}`);
        concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

        text = text.replace(embed.placeholder, embed.written);
      }
    }

    page.text.written = text;
  }

  // Radio

  if(preview) {
    data.radio.image.written = encodeURI(`${data.rootServerUrl}/${data.radio.image.localFilesystemPath}`);
  } else {
    data.radio.image.written = path.join('/radio', `header${path.extname(data.radio.image.normalizedPath)}`);
    concurrentWrites.push( copyResized(data.radio.image.localFilesystemPath, data.radio.image.written) );
  }

  for(let program of data.programs.values()) {
    if(program.image) {
      if(preview) {
        program.image.written = encodeURI(`${data.rootServerUrl}/${program.image.localFilesystemPath}`);
      } else {
        program.image.written = path.join('/radio', program.permalink, `bild${path.extname(program.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(program.image.localFilesystemPath, program.image.written) );
      }
    }

    if(program.soundfile) {
      if(preview) {
        program.soundfile.written = encodeURI(`${data.rootServerUrl}/${program.soundfile.localFilesystemPath}`);
      } else {
        program.soundfile.written = path.join('/radio', program.permalink, `aufnahme${path.extname(program.soundfile.normalizedPath)}`);
        concurrentWrites.push( copy(program.soundfile.localFilesystemPath, program.soundfile.written) );
      }
    }

    if(program.text) {
      let text = program.text.converted;

      if(preview) {
        for(let download of program.text.downloads) {
          download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of program.text.embeds) {
          embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of program.text.downloads) {
          download.written = path.join('/radio', program.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of program.text.embeds) {
          embed.written = path.join('/radio', program.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      program.text.written = text;
    }
  }

  await Promise.all(concurrentWrites);
};
