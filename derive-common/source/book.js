const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { validateArray,
        validateKeys,
        validateInteger,
        validateMarkdown,
        validatePath,
        validatePermalink,
        validateString,
        ValidationError } = require('../validate.js');

const specifiedKeys = [
  'Autoren/Herausgeber',
  'Cover',
  'Erscheinungsjahr',
  'Erscheinungsort',
  'ISBN/ISSN',
  'Permalink',
  'Preis',
  'Seitenanzahl',
  'Tags',
  'Titel',
  'URL',
  'Verlagstext',
  'Verleger'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.books.set(plainPath, cached.book);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das betroffene Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten eines Buchs`
        });

        return;
      } else {
        throw err;
      }
    }

    const book = { sourceFile: plainPath };

    try {
      book.title = validateString(document, 'Titel', { required: true });
      book.permalink = validatePermalink(document, 'Permalink', { required: true });

      validateKeys(document, specifiedKeys);

      book.isxn = validateString(document, 'ISBN/ISSN');
      book.url = validateString(document, 'URL');
      book.placeOfPublication = validateString(document, 'Erscheinungsort');
      book.yearOfPublication = validateInteger(document, 'Erscheinungsjahr');
      book.numberOfPages = validateInteger(document, 'Seitenanzahl');
      book.price = validateString(document, 'Preis');
      book.authors = { sourced: validateArray(document, 'Autoren/Herausgeber') };
      book.publishers = { sourced: validateArray(document, 'Verleger') };
      book.tags = { sourced: validateArray(document, 'Tags') };
      book.cover = validatePath(document, 'Cover');
      book.description = validateMarkdown(document, 'Verlagstext');
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das betroffene Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${book.title ? `des Buchs "${book.title}"` : 'eines Buchs'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { book: book, stats: stats });
    data.books.set(plainPath, book);
  }
};
