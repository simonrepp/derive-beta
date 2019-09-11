class ConnectMediaError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, ConnectMediaError);
  }
}

const connectMedia = (data, field) => {
  const media = data.media.get(field.normalizedPath);

  if(media) {
    field.localFilesystemPath = media.localFilesystemPath;
    media.used = true;

    return true;
  } else {
    return null;
  }
};

const connectMarkdownMedia = (data, field, fieldName) => {
  for(let type of ['downloads', 'embeds']) {
    for(let mediaReference of field[type]) {
      const media = data.media.get(mediaReference.normalizedPath);

      if(media) {
        media.used = true;
        mediaReference.localFilesystemPath = media.localFilesystemPath;
      } else {
        throw new ConnectMediaError(`Das Markdown-Feld "${fieldName}" enthält einen Verweis auf die Datei "${mediaReference.normalizedPath}", diese wurde aber nicht gefunden.`);
      }
    }
  }
};

module.exports = data => {
  data.articles.forEach(article => {
    if(article.image && !connectMedia(data, article.image)) {
      data.warnings.push({
        files: [{ path: article.sourceFile }],
        message: `Der Artikel "${article.title}" referenziert im Dateifeld "Bild" die Datei "${article.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.articles.delete(article.sourceFile);
    }

    if(article.text) {
      try {
        connectMarkdownMedia(data, article.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            files: [{ path: article.sourceFile }],
            message: `Problem beim prüfen der eingebetteten Mediendateien im Artikel "${article.title}": ${err.message}`
          });

          data.articles.delete(article.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.books.forEach(book => {
    if(book.cover && !connectMedia(data, book.cover)) {
      data.warnings.push({
        files: [{ path: book.sourceFile }],
        message: `Das Buch "${book.title}" referenziert im Dateifeld "Cover" die Datei "${book.cover.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.books.delete(book.sourceFile);
    }
  });

  for(const screening of data.screenings.values()) {
    if(!connectMedia(data, screening.image)) {
      data.warnings.push({
        files: [{ path: screening.sourceFile }],
        message: `Das Bild "${screening.image.normalizedPath}", dass bei einem der Termine auf der Kino Seite referenziert wird, wurde nicht gefunden.` // TODO: Here and elsewhere generate an actual eno style error?
      });

      data.screenings.delete(screening.sourceFile);
    }
  }

  // TODO: Connect only urbanize events with urbanize media (and likewise for all derive-contained data)
  for(const event of Object.values(data.urbanize.events)) {
    if(event.image && !connectMedia(data, event.image)) {
      data.warnings.push({
        files: [{ path: event.sourceFile }],
        message: `Die Veranstaltung "${event.title}" referenziert im Dateifeld "Bild" die Datei "${event.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      delete data.urbanize.events[event.sourceFile];
    }

    if(event.text) {
      try {
        connectMarkdownMedia(data, event.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            files: [{ path: event.sourceFile }],
            message: `Problem beim prüfen der eingebetteten Mediendateien in der Veranstaltung "${event.title}": ${err.message}`
          });

          delete data.urbanize.events[event.sourceFile];
        } else {
          throw err;
        }
      }
    }
  }

  data.features.forEach(feature => {
    if(feature.image && !connectMedia(data, feature.image)) {
      data.warnings.push({
        files: [{ path: feature.sourceFile }],
        message: `Das Feature "${feature.title}" referenziert im Dateifeld "Bild" die Datei "${feature.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.features.delete(feature.sourceFile);
    }
  });

  for(const feature of data.urbanize.home.features) {
    if(feature.image && !connectMedia(data, feature.image)) {
      data.warnings.push({
        files: [{ path: data.urbanize.home.sourceFile }],
        message: `Das Feature "${feature.title}" referenziert im Dateifeld "Bild" die Datei "${feature.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      // TODO: Revisit if this even works/does not mess up the state completely, Pt. I
      feature.flaggedForRemoval = true;
    }

    // TODO: Revisit if this even works/does not mess up the state completely, Pt. II
    data.urbanize.home.features = data.urbanize.home.features.filter(feature => !feature.hasOwnProperty('flaggedForRemoval'));
  }

  // TODO: Revisit how the singular data.festival section is invalidated on error (set to null?) and if this is all gracefully and soundly handled
  if(data.festival) {
    if(connectMedia(data, data.festival.image)) {

      // TODO: Here (and elsewhere?) probably needs a for(const of .. ) loop and if an error occurs we break out of that loop because there's nothing more to do
      data.festival.editions.forEach(edition => {
        if(!connectMedia(data, edition.image)) {
          data.errors.push({
            files: [{ path: data.festival.sourceFile }],
            message: `Das Bild "${edition.image.normalizedPath}", dass unter einer der vergangengen Editionen auf der Festivalseite referenziert wird, wurde nicht gefunden.`
          });

          data.festival = null;
        }
      });
    } else {
      data.errors.push({
        files: [{ path: data.festival.sourceFile }],
        message: `Das Bild "${data.festival.image.normalizedPath}", dass als Headerbild der Festivalseite referenziert wird, wurde nicht gefunden.`
      });

      data.festival = null;
    }
  }

  data.issues.forEach(issue => {
    if(issue.cover && !connectMedia(data, issue.cover)) {
      data.warnings.push({
        files: [{ path: issue.sourceFile }],
        message: `Die Zeitschrift #${issue.number} referenziert im Dateifeld "Bild" die Datei "${issue.cover.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.issues.delete(issue.sourceFile);
    }
  });

  data.pages.forEach(page => {
    if(page.text) {
      try {
        connectMarkdownMedia(data, page.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            files: [{ path: page.sourceFile }],
            message: `Problem beim prüfen der eingebetteten Mediendateien auf der Seite "${page.title}": ${err.message}`
          });

          data.pages.delete(page.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  for(const page of Object.values(data.urbanize.pages)) {
    if(!page.text) continue;

    try {
      connectMarkdownMedia(data, page.text, 'Text');
    } catch(err) {
      if(!(err instanceof ConnectMediaError))
        throw err;

      data.warnings.push({
        files: [{ path: page.sourceFile }],
        message: `Problem beim prüfen der eingebetteten Mediendateien auf der Seite "${page.title}": ${err.message}`
      });

      delete data.urbanize.pages[page.sourceFile];
    }
  }

  data.programs.forEach(program => {
    if(program.image && !connectMedia(data, program.image)) {
      data.warnings.push({
        files: [{ path: program.sourceFile }],
        message: `Die Radiosendung "${program.title}" referenziert im Dateifeld "Bild" die Datei "${program.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.programs.delete(program.sourceFile);
      return;
    }

    if(program.soundfile && !connectMedia(data, program.soundfile)) {
      data.warnings.push({
        files: [{ path: program.sourceFile }],
        message: `Die Radiosendung "${program.title}" referenziert im Dateifeld "Soundfile" die Datei "${program.soundfile.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.programs.delete(program.sourceFile);
      return;
    }

    if(program.text) {
      try {
        connectMarkdownMedia(data, program.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            files: [{ path: program.sourceFile }],
            message: `Problem beim prüfen der eingebetteten Mediendateien in der Radiosendung "${program.title}": ${err.message}`
          });

          data.programs.delete(program.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });
};
