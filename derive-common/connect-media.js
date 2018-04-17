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
        description: 'Bis zur Lösung des Problems scheint der Artikel nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
        files: [{ path: article.sourceFile }],
        message: `**${article.sourceFile}**\n\nDer Artikel "${article.title}" referenziert im Dateifeld "Bild" die Datei "${article.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.articles.delete(article.sourceFile);
    }

    if(article.text) {
      try {
        connectMarkdownMedia(data, article.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: 'Bis zur Lösung des Problems scheint der Artikel nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
            files: [{ path: article.sourceFile }],
            message: `**${article.sourceFile}**\n\nProblem beim prüfen der eingebetteten Mediendateien im Artikel "${article.title}": ${err.message}`
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
        description: 'Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
        files: [{ path: book.sourceFile }],
        message: `**${book.sourceFile}**\n\nDas Buch "${book.title}" referenziert im Dateifeld "Cover" die Datei "${book.cover.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.books.delete(book.sourceFile);
    }
  });

  data.events.forEach(event => {
    if(event.image && !connectMedia(data, event.image)) {
      data.warnings.push({
        description: 'Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
        files: [{ path: event.sourceFile }],
        message: `**${event.sourceFile}**\n\nDie Veranstaltung "${event.title}" referenziert im Dateifeld "Bild" die Datei "${event.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.events.delete(event.sourceFile);
    }

    if(event.text) {
      try {
        connectMarkdownMedia(data, event.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: 'Bis zur Lösung des Problems scheint die Veranstaltung nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
            detail: err.message,
            files: [{ path: event.sourceFile }],
            message: `**${event.sourceFile}**\n\nProblem beim prüfen der eingebetteten Mediendateien in der Veranstaltung "${event.title}": ${err.message}`
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
        description: 'Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
        files: [{ path: feature.sourceFile }],
        message: `**${feature.sourceFile}**\n\nDas Feature "${feature.title}" referenziert im Dateifeld "Bild" die Datei "${feature.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.features.delete(feature.sourceFile);
    }
  });

  if(data.festival) {
    data.festival.editions.forEach(edition => {
      if(!connectMedia(data, edition.image)) {
        data.errors.push({
          description: 'Da es sich bei diesen Daten um essentielle Basisdaten der Website handelt, muss dieses Problem gelöst werden bevor wieder an der Website gearbeitet werden kann.',
          files: [{ path: festival.sourceFile }],
          message: `**${festival.sourceFile}**\n\nDas Bild "${edition.image.normalizedPath}", dass unter einer der vergangengen Editionen auf der Festivalseite referenziert wird, wurde nicht gefunden.`
        });

        data.festival = null;
      }
    });
  }

  data.issues.forEach(issue => {
    if(issue.cover && !connectMedia(data, issue.cover)) {
      data.warnings.push({
        description: 'Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
        files: [{ path: issue.sourceFile }],
        message: `**${issue.sourceFile}**\n\nDie Zeitschrift #${issue.number} referenziert im Dateifeld "Bild" die Datei "${issue.cover.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
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
            description: `Bis zur Lösung des Problems scheint die Seite nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.`,
            files: [{ path: page.sourceFile }],
            message: `**${page.sourceFile}**\n\nProblem beim prüfen der eingebetteten Mediendateien auf der Seite "${page.title}": ${err.message}`
          });

          data.pages.delete(page.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.programs.forEach(program => {
    if(program.image && !connectMedia(data, program.image)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.`,
        files: [{ path: program.sourceFile }],
        message: `**${program.sourceFile}**\n\nDie Radiosendung "${program.title}" referenziert im Dateifeld "Bild" die Datei "${program.image.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
      });

      data.programs.delete(program.sourceFile);
      return;
    }

    if(program.soundfile && !connectMedia(data, program.soundfile)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint das Soundfile nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.`,
        files: [{ path: program.sourceFile }],
        message: `**${program.sourceFile}**\n\nDie Radiosendung "${program.title}" referenziert im Dateifeld "Soundfile" die Datei "${program.soundfile.normalizedPath}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`
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
            description: `Bis zur Lösung des Problems scheint die Radiosendung nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.`,
            files: [{ path: program.sourceFile }],
            message: `**${program.sourceFile}**\n\nProblem beim prüfen der eingebetteten Mediendateien in der Radiosendung "${program.title}": ${err.message}`
          });

          data.programs.delete(program.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });
};
