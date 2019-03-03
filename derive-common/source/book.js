const { loadEno, statFile } = require('../util.js');
const { ParseError, ValidationError } = require('enolib');

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

    doc.allElementsRequired();

    try {
      book.titleField = doc.field('Titel');
      book.title = book.titleField.requiredStringValue();
      book.permalinkField = doc.field('Permalink');
      book.permalink = book.permalinkField.requiredPermalinkValue();
      book.yearOfPublication = doc.field('Erscheinungsjahr').requiredIntegerValue();
      book.isxn = doc.field('ISBN/ISSN').optionalStringValue();
      book.url = doc.field('URL').optionalUrlValue();
      book.placeOfPublication = doc.field('Erscheinungsort').optionalStringValue();
      book.numberOfPages = doc.field('Seitenanzahl').optionalIntegerValue();
      book.price = doc.field('Preis').optionalStringValue();
      book.featuredRank = doc.field('Featured (Position)').optionalIntegerValue();
      book.authorReferences = doc.list('Autoren/Herausgeber').items().map(item => ({ item, name: item.requiredStringValue() }));
      book.publisherReferences = doc.list('Verleger').items().map(item => ({ item, name: item.requiredStringValue() }));
      book.tagsDisconnected = doc.list('Tags').requiredStringValues();
      book.cover = doc.field('Cover').optionalPathValue();
      book.description = doc.field('Verlagstext').optionalMarkdownValue();

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
