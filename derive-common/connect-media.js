const path = require('path');

class ConnectMediaError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, ConnectMediaError);
  }
}

const { renderMarkdown } = require('./util.js');

const conversionEmbeddableMediaExtensions = [
  '.tif', '.TIF',
  '.tiff', '.TIFF'
];

const verbatimEmbeddableMediaExtensions = [
  '.gif', '.GIF',
  '.jpg', '.JPG',
  '.jpeg', '.JPEG',
  '.png', '.PNG'
];

const htmlMediaRegex = /(src|href)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
const markdownMediaRegex = /(!|)\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;
// TODO: Pluggable, modulare regex components to build the md/html rules - also think more in terms of inception matching (no src="" inside src="", no ![]() inside ![]() ..)
// match(/!\[((?!!\[.*\]\(.*\)).)*\]\(((?!!\[.*\]\(.*\)).)*\)/g); TODO possibly resuse to improve regexes later, missing ](https?: NEGATIVE LOOKAHEAD THINGY


const connectMedia = (data, mediaPath) => {
  const normalizedPath = mediaPath.replace(/^\//, '').normalize();

  if(data.media.has(normalizedPath)) {
    data.media.set(normalizedPath, true);

    return true;
  } else {
    return false;
  }
};

// TODO: Move the markdown conversion to sourcing if possible (only problem: whitespace in media paths)

const connectMarkdownMedia = (data, field, fieldName) => {
  if(field.hasOwnProperty('downloads') && field.hasOwnProperty('embeds')) {
    ['downloads', 'embeds'].forEach(mediaType => {
      field[mediaType].forEach((replacedMediaPath, originalMediaPath) => {
        const normalizedFilePath = originalMediaPath.replace(/^\//, '').normalize();

        if(data.media.has(normalizedFilePath)) {
          data.media.set(normalizedFilePath, true);
        } else {
          throw new ConnectMediaError(`Das Markdown-Feld "${fieldName}" enthält einen Verweis auf die Datei "${originalMediaPath}", diese wurde aber nicht gefunden.`);
        }
      });
    })
  } else {
    let markdown = field.sourced;

    const downloads = new Map();
    const embeds = new Map();
    let downloadNumber = 1;
    let embedNumber = 1;

    const connectEmbeddedMedia  = (fullMatch, typeMatch, urlMatch) => {
      const normalizedFilePath = urlMatch.replace(/^\//, '').normalize();

      if(data.media.has(normalizedFilePath)) {
        const fileExtension = path.extname(urlMatch);

        if(typeMatch === '!' || typeMatch === 'src') {
          if(verbatimEmbeddableMediaExtensions.includes(fileExtension)) {
            const replacedFilePath = `${fieldName.toLowerCase()}-embed-${embedNumber++}${fileExtension}`;

            data.media.set(normalizedFilePath, true);
            embeds.set(urlMatch, replacedFilePath);

            return fullMatch.replace(urlMatch, replacedFilePath);
          } else if(conversionEmbeddableMediaExtensions.includes(fileExtension)) {
            const replacedFilePath = `${fieldName.toLowerCase()}-embed-${embedNumber++}.png`;

            data.media.set(normalizedFilePath, true);
            embeds.set(urlMatch, replacedFilePath);

            return fullMatch.replace(urlMatch, replacedFilePath);
          } else {
            throw new ConnectMediaError(`Das Markdown-Feld "${fieldName}" enthält einen Embed der Datei "${urlMatch}", dessen Dateityp ist aber für Embeds nicht erlaubt.`);
          }
        } else if(typeMatch === '' || typeMatch === 'href') {
          const replacedFilePath = `${fieldName.toLowerCase()}-download-${downloadNumber++}${fileExtension}`;

          data.media.set(normalizedFilePath, true);
          downloads.set(urlMatch, replacedFilePath);

          return fullMatch.replace(urlMatch, replacedFilePath);
        } else {
          throw('Interner Fehler bei der RegExp-basierten Detektion von referenzierten Mediendateien.')
        }
      } else {
        throw new ConnectMediaError(`Das Markdown-Feld "${fieldName}" enthält einen Verweis auf die Datei "${urlMatch}", diese wurde aber nicht gefunden.`);
      }
    };

    markdown = markdown.replace(markdownMediaRegex, connectEmbeddedMedia);
    markdown = markdown.replace(htmlMediaRegex, connectEmbeddedMedia);

    let html;

    try {
      html = renderMarkdown(markdown);
    } catch(err) {
      // Unclear if this could ever happen - quickly consult md-it documentation ?
      throw new ValidationError(`Das Markdown im Feld "${fieldName}" hat beim konvertieren einen Fehler ausgelöst: ${err}`);
    }

    field.connected = html;
    field.downloads = downloads;
    field.embeds = embeds;
  }
};

module.exports = data => {
  data.articles.forEach(article => {
    if(article.image) {
      if(connectMedia(data, article.image.sourced)) {
        article.image.connected = article.image.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint der Artikel nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${article.sourceFile}`,
          detail: `Der Artikel "${article.title}" referenziert im Dateifeld "Bild" die Datei "${article.image.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: article.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einer Mediendatei'
        });

        data.articles.delete(article.sourceFile);
      }
    }

    if(article.text) {
      try {
        connectMarkdownMedia(data, article.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: `Bis zur Lösung des Problems scheint der Artikel nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${article.sourceFile}`,
            detail: err.message,
            files: [{ path: article.sourceFile }],
            header: `Problem beim prüfen der eingebetteten Mediendateien im Artikel "${article.title}"`
          });

          data.articles.delete(article.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.books.forEach(book => {
    if(book.cover) {
      if(connectMedia(data, book.cover.sourced)) {
        book.cover.connected = book.cover.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${book.sourceFile}`,
          detail: `Das Buch "${book.title}" referenziert im Dateifeld "Cover" die Datei "${book.cover.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: book.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einem Coverbild'
        });

        book.cover.connected = null;
        data.books.delete(book.sourceFile);
      }
    }
  });

  data.events.forEach(event => {
    if(event.image) {
      if(connectMedia(data, event.image.sourced)) {
        event.image.connected = event.image.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${event.sourceFile}`,
          detail: `Die Veranstaltung "${event.title}" referenziert im Dateifeld "Bild" die Datei "${event.image.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: event.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einem Bild'
        });

        event.image.connected = null;
        data.events.delete(event.sourceFile);
      }
    }

    if(event.text) {
      try {
        connectMarkdownMedia(data, event.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: `Bis zur Lösung des Problems scheint die Veranstaltung nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${event.sourceFile}`,
            detail: err.message,
            files: [{ path: event.sourceFile }],
            header: `Problem beim prüfen der eingebetteten Mediendateien in der Veranstaltung "${event.title}"`
          });

          data.events.delete(event.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.issues.forEach(issue => {
    if(issue.cover) {
      if(connectMedia(data, issue.cover.sourced)) {
        issue.cover.connected = issue.cover.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${issue.sourceFile}`,
          detail: `Die Zeitschrift #${issue.number} referenziert im Dateifeld "Bild" die Datei "${issue.cover.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: issue.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einem Coverbild'
        });

        issue.cover.connected = null;
        data.issues.delete(issue.sourceFile);
      }
    }
  });

  data.pages.forEach(page => {
    if(page.text) {
      try {
        connectMarkdownMedia(data, page.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: `Bis zur Lösung des Problems scheint die Seite nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${page.sourceFile}`,
            detail: err.message,
            files: [{ path: page.sourceFile }],
            header: `Problem beim prüfen der eingebetteten Mediendateien auf der Seite "${page.title}"`
          });

          data.pages.delete(page.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });

  data.programs.forEach(program => {
    if(program.image) {
      if(connectMedia(data, program.image.sourced)) {
        program.image.connected = program.image.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das Bild nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${program.sourceFile}`,
          detail: `Die Radiosendung "${program.title}" referenziert im Dateifeld "Bild" die Datei "${program.image.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: program.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einem Bild'
        });

        data.programs.delete(program.sourceFile);
        return
      }
    }

    if(program.soundfile) {
      if(connectMedia(data, program.soundfile.sourced)) {
        program.soundfile.connected = program.soundfile.sourced;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das Soundfile nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${program.sourceFile}`,
          detail: `Die Radiosendung "${program.title}" referenziert im Dateifeld "Soundfile" die Datei "${program.soundfile.sourced}", unter dem angegebenen Pfad wurde aber keine Datei gefunden.`,
          files: [{ path: program.sourceFile }],
          header: 'Problem beim prüfen der Verlinkung zu einem Soundfile'
        });

        data.programs.delete(program.sourceFile);
        return
      }
    }

    if(program.text) {
      try {
        connectMarkdownMedia(data, program.text, 'Text');
      } catch(err) {
        if(err instanceof ConnectMediaError) {
          data.warnings.push({
            description: `Bis zur Lösung des Problems scheint die Radiosendung nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${program.sourceFile}`,
            detail: err.message,
            files: [{ path: program.sourceFile }],
            header: `Problem beim prüfen der eingebetteten Mediendateien in der Radiosendung "${program.title}"`
          });

          data.programs.delete(program.sourceFile);
        } else {
          throw err;
        }
      }
    }
  });
};
