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

  // TODO: Revisit how the singular data.cinema, data.festival, data.radio sections are invalidated on error (set to null?) and if this is all gracefully and soundly handled
  if(data.cinema) {
    if(connectMedia(data, data.cinema.image)) {
      for(const date of data.cinema.dates) {
        if(!connectMedia(data, date.image)) {
          data.errors.push({
            files: [{ path: data.cinema.sourceFile }],
            message: `Das Bild "${date.image.normalizedPath}", dass bei einem der Termine auf der Stadt Streifen Seite referenziert wird, wurde nicht gefunden.`
          });

          data.cinema = null;
          break;
        }
      }
    } else {
      data.errors.push({
        files: [{ path: data.cinema.sourceFile }],
        message: `Das Bild "${data.cinema.image.normalizedPath}", dass als Headerbild der Stadt Streifen Seite referenziert wird, wurde nicht gefunden.`
      });

      data.cinema = null;
    }
  }

  data.events.forEach(event => {
    if(event.image && !connectMedia(data, event.image)) {
      data.warnings.push({
        files: [{ path: event.sourceFile }],
        message: `Die Veranstaltung "${event.title}" referenziert im Dateifeld "Bild" die Datei "${event.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.events.delete(event.sourceFile);
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

          data.events.delete(event.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.features.forEach(feature => {
    if(feature.image && !connectMedia(data, feature.image)) {
      data.warnings.push({
        files: [{ path: feature.sourceFile }],
        message: `Das Feature "${feature.title}" referenziert im Dateifeld "Bild" die Datei "${feature.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.features.delete(feature.sourceFile);
    }
  });

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

  if(data.radio) {
    if(!connectMedia(data, data.radio.image)) {
      data.errors.push({
        files: [{ path: data.radio.sourceFile }],
        message: `Das Bild "${data.radio.image.normalizedPath}", dass als Headerbild der Radioseite referenziert wird, wurde nicht gefunden.`
      });

      data.radio = null;
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
