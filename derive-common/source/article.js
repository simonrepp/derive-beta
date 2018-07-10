const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateBoolean = require('../validate/boolean.js'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.articles.set(enoPath, cached.article);
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

    const article = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      const title = doc.field('Titel', { required: true, withElement: true });
      article.title = title.value;
      article.titleElement = title.element;

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      article.permalink = permalink.value;
      article.permalinkElement = permalink.element;

      article.subtitle = doc.field('Untertitel');
      article.image = doc.field('Bild', validatePath);
      article.authorReferences = doc.list('Autoren', { withElements: true });
      article.date = doc.datetime('Datum');  // TODO: User doc.date() only loader as soon as available from enojs
      article.language = doc.field('Sprache');
      article.categoriesDisconnected = doc.list('Kategorien');
      article.tagsDisconnected = doc.list('Tags');
      article.reviewedBookReferences = doc.list('Buchbesprechungen', { withElements: true });
      article.readable = doc.field('Lesbar', validateBoolean);
      article.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));
      article.abstract = doc.field('Abstract', validateMarkdown);
      article.bibliography = doc.field('Literaturverzeichnis', validateMarkdown);
      article.text = doc.field('Text', validateMarkdownWithMedia);

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

    data.cache.set(enoPath, { article: article, stats: stats });
    data.articles.set(enoPath, article);
  }
};
