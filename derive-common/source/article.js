const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/errors.js'),
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
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
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

    const article = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    try {
      const title = document.value('Titel', { required: true, withTrace: true });
      article.title = title.value;
      article.titleTrace = title.trace;

      const permalink = document.value('Permalink', validatePermalink, { required: true, withTrace: true });
      article.permalink = permalink.value;
      article.permalinkTrace = permalink.trace;

      article.subtitle = document.value('Untertitel');
      article.image = document.value('Bild', validatePath);
      article.authorReferences = document.values('Autoren', { withTrace: true });
      article.date = document.value('Datum');
      article.language = document.value('Sprache');
      article.categoriesDisconnected = document.values('Kategorien');
      article.tagsDisconnected = document.values('Tags');
      article.reviewedBookReferences = document.values('Buchbesprechungen', { withTrace: true });
      article.readable = document.value('Lesbar', validateBoolean);
      article.urbanize = document.value('Urbanize', validateEnum(URBANIZE_ENUM));
      article.abstract = document.value('Abstract', validateMarkdown);
      article.bibliography = document.value('Literaturverzeichnis', validateMarkdown);
      article.text = document.value('Text', validateMarkdownWithMedia);

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

    data.cache.set(plainPath, { article: article, stats: stats });
    data.articles.set(plainPath, article);
  }
};
