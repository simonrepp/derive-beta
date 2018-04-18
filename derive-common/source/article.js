const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
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

    const article = { sourceFile: plainPath };

    try {

      article.title = document.value('Titel', { required: true });
      article.titleMeta = document.meta('Titel');
      article.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      article.permalinkMeta = document.meta('Permalink');
      article.subtitle = document.value('Untertitel');
      article.image = document.value('Bild', { process: validatePath });
      article.authors = { sourced: document.values('Autoren') };
      article.date = document.value('Datum');
      article.language = document.value('Sprache');
      article.categories = { sourced: document.values('Kategorien') };
      article.tags = { sourced: document.values('Tags') };
      article.bookReviews = { sourced: document.values('Buchbesprechungen') };
      article.publish = document.value('Veröffentlichen', { process: validateBoolean });
      article.readable = document.value('Lesbar', { process: validateBoolean });
      article.urbanize = document.value('Urbanize', { process: validateEnum(URBANIZE_ENUM) });
      article.abstract = document.value('Abstract', { process: validateMarkdown });
      article.bibliography = document.value('Literaturverzeichnis', { process: validateMarkdown });
      article.text = document.value('Text', { process: validateMarkdownWithMedia });

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
