const { loadPlain, statFile } = require('../util.js'),
      { PlainValidationError, PlainParseError } = require('../../plain/plain.js'),
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
    let doc;

    try {
      doc = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainParseError) {
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

    doc.enforcePresence(true);

    try {
      const title = doc.field('Titel', { required: true, withTrace: true });
      book.title = title.value;
      book.titleTrace = title.trace;

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      book.permalink = permalink.value;
      book.permalinkTrace = permalink.trace;

      book.yearOfPublication = doc.field('Erscheinungsjahr', validateInteger, { required: true });
      book.isxn = doc.field('ISBN/ISSN');
      book.url = doc.field('URL', validateAbsoluteUrl);
      book.placeOfPublication = doc.field('Erscheinungsort');
      book.numberOfPages = doc.field('Seitenanzahl', validateInteger);
      book.price = doc.field('Preis');
      book.authorReferences = doc.list('Autoren/Herausgeber', { withTrace: true });
      book.publisherReferences = doc.list('Verleger', { withTrace: true });
      book.tagsDisconnected = doc.list('Tags');
      book.cover = doc.field('Cover', validatePath);
      book.description = doc.field('Verlagstext', validateMarkdown);

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainValidationError) {
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
