const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('../../enojs/eno.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateDate = require('../validate/date.js'),
      validateEnum = require('../validate/enum.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.articles.set(plainPath, cached.article);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof EnoParseError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const article = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);

    try {
      const title = doc.field('Titel', { required: true, withTrace: true });
      article.title = title.value;
      article.titleTrace = title.trace;

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      article.permalink = permalink.value;
      article.permalinkTrace = permalink.trace;

      article.subtitle = doc.field('Untertitel');
      article.image = doc.field('Bild', validatePath);
      article.authorReferences = doc.list('Autoren', { withTrace: true });
      article.date = doc.field('Datum');
      article.language = doc.field('Sprache');
      article.categoriesDisconnected = doc.list('Kategorien');
      article.tagsDisconnected = doc.list('Tags');
      article.reviewedBookReferences = doc.list('Buchbesprechungen', { withTrace: true });
      article.readable = doc.field('Lesbar', validateBoolean);
      article.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));
      article.abstract = doc.field('Abstract', validateMarkdown);
      article.bibliography = doc.field('Literaturverzeichnis', validateMarkdown);
      article.text = doc.field('Text', validateMarkdownWithMedia);

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof EnoValidationError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { article: article, stats: stats });
    data.articles.set(plainPath, article);
  }
};
