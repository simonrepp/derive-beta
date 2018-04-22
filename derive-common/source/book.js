const { loadPlain, statFile } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/plaindata.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

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
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const book = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    try {
      const title = document.value('Titel', { required: true, withTrace: true });
      book.title = title.value;
      book.titleTrace = title.trace;

      const permalink = document.value('Permalink', validatePermalink, { required: true, withTrace: true });
      book.permalink = permalink.value;
      book.permalinkTrace = permalink.trace;

      book.yearOfPublication = document.value('Erscheinungsjahr', validateInteger, { required: true });
      book.isxn = document.value('ISBN/ISSN');
      book.url = document.value('URL', validateAbsoluteUrl);
      book.placeOfPublication = document.value('Erscheinungsort');
      book.numberOfPages = document.value('Seitenanzahl', validateInteger);
      book.price = document.value('Preis');
      book.authorReferences = document.values('Autoren/Herausgeber', { withTrace: true });
      book.publisherReferences = document.values('Verleger', { withTrace: true });
      book.tagsDisconnected = document.values('Tags');
      book.cover = document.value('Cover', validatePath);
      book.description = document.value('Verlagstext', validateMarkdown);

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataValidationError) {
        data.warnings.push({
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
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
