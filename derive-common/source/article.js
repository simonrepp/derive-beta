const { loadEno, statFile } = require('../util.js');
const { ParseError, ValidationError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.articles.set(enoPath, cached.article);
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

    const article = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      article.titleField = doc.field('Titel');
      article.title = article.titleField.requiredStringValue();

      article.permalinkField = doc.field('Permalink');
      article.permalink = article.permalinkField.requiredPermalinkValue();

      article.subtitle = doc.field('Untertitel').optionalStringValue();
      article.image = doc.field('Bild').optionalPathValue();
      article.imageCaption = doc.field('Bilduntertitel').optionalStringValue();
      article.authorReferences = doc.list('Autoren').items().map(item => ({ item, name: item.requiredStringValue() }));
      article.date = doc.field('Datum').optionalDateValue();
      article.language = doc.field('Sprache').optionalStringValue();
      article.categoriesDisconnected = doc.list('Kategorien').requiredStringValues();
      article.tagsDisconnected = doc.list('Tags').requiredStringValues();
      article.reviewedBookReferences = doc.list('Buchbesprechungen').items().map(item => ({ item, title: item.requiredStringValue() }))
      article.readable = doc.field('Lesbar').requiredBooleanValue();
      article.abstract = doc.field('Abstract').optionalMarkdownValue();
      article.bibliography = doc.field('Literaturverzeichnis').optionalMarkdownValue();
      article.text = doc.field('Text').optionalMarkdownWithMediaValue();

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

    data.cache.set(enoPath, { article: article, stats: stats });
    data.articles.set(enoPath, article);
  }
};
