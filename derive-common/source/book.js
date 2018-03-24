const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

const { loadToml } = require('../lib.js'),
      { validateArray,
        validateEmpty,
        validateMarkdown,
        validatePath,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.books.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint das betroffene Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten eines Buchs`
    });

    return;
  }

  const book = { sourceFile: tomlPath };

  try {
    book.title = validateString(document, 'Titel', true);
    book.isxn = validateString(document, 'ISBN_ISSN');
    book.url = validateString(document, 'URL');
    book.placeOfPublication = validateString(document, 'Erscheinungsort');
    book.yearOfPublication = validateString(document, 'Erscheinungsjahr');
    book.numberOfPages = validateString(document, 'Seitenanzahl');
    book.price = validateString(document, 'Preis');
    book.authors = validateArray(document, 'Autoren_Herausgeber');
    book.publishers = validateArray(document, 'Verleger');
    book.tags = validateArray(document, 'Tags');
    book.cover = validatePath(document, 'Cover', data);
    book.permalink = validateString(document, 'Permalink', true);
    book.description = validateMarkdown(document, 'Verlagstext', data);

    validateEmpty(document);
  } catch(err) {
    data.books.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint das betroffene Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${book.title ? `des Buchs "${book.title}"` : 'eines Buchs'}`
    });

    return;
  }

  data.books.set(tomlPath, book);
};
