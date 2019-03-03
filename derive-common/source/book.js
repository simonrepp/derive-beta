const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const { validateMarkdown } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');
const validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.books.set(enoPath, cached.book);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ParseError) {
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
      draft: /\.entwurf\.eno$/.test(enoPath),
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

      book.yearOfPublication = doc.number('Erscheinungsjahr', { required: true });
      book.isxn = doc.field('ISBN/ISSN');
      book.url = doc.url('URL');
      book.placeOfPublication = doc.field('Erscheinungsort');
      book.numberOfPages = doc.number('Seitenanzahl');
      book.price = doc.field('Preis');
      book.featuredRank = doc.number('Featured (Position)');
      book.authorReferences = doc.list('Autoren/Herausgeber', { withElements: true });
      book.publisherReferences = doc.list('Verleger', { withElements: true });
      book.tagsDisconnected = doc.list('Tags');
      book.cover = doc.field('Cover', validatePath);
      book.description = doc.field('Verlagstext', validateMarkdown);

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ValidationError) {
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
