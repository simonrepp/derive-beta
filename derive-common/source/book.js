const { loadPlainRich, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

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
      document = await loadPlainRich(data.root, plainPath);
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
      book.title = document.value('Titel', { required: true });
      book.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      book.yearOfPublication = document.value('Erscheinungsjahr', { process: validateInteger, required: true });

      // validateKeys(document.value(specifiedKeys);

      book.isxn = document.value('ISBN/ISSN');
      book.url = document.value('URL', { process: validateAbsoluteUrl });
      book.placeOfPublication = document.value('Erscheinungsort');
      book.numberOfPages = document.value('Seitenanzahl', { process: validateInteger });
      book.price = document.value('Preis');
      book.authors = { sourced: document.values('Autoren/Herausgeber') };
      book.publishers = { sourced: document.values('Verleger') };
      book.tags = { sourced: document.values('Tags') };
      book.cover = document.value('Cover', { process: validatePath });
      book.description = document.value('Verlagstext', { process: validateMarkdown });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
