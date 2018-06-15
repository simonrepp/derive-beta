const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.books.set(enoPath, cached.book);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof EnoParseError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const book = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      const title = doc.field('Titel', { required: true, withElement: true });
      book.title = title.value;
      book.titleElement = title.element;

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      book.permalink = permalink.value;
      book.permalinkElement = permalink.element;

      book.yearOfPublication = doc.field('Erscheinungsjahr', validateInteger, { required: true });
      book.isxn = doc.field('ISBN/ISSN');
      book.url = doc.field('URL', validateAbsoluteUrl);
      book.placeOfPublication = doc.field('Erscheinungsort');
      book.numberOfPages = doc.field('Seitenanzahl', validateInteger);
      book.price = doc.field('Preis');
      book.authorReferences = doc.list('Autoren/Herausgeber', { withElements: true });
      book.publisherReferences = doc.list('Verleger', { withElements: true });
      book.tagsDisconnected = doc.list('Tags');
      book.cover = doc.field('Cover', validatePath);
      book.description = doc.field('Verlagstext', validateMarkdown);

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof EnoValidationError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(enoPath, { book: book, stats: stats });
    data.books.set(enoPath, book);
  }
};
