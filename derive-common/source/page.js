const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainValidationError, PlainParseError } = require('../../plain/plain.js'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.pages.set(plainPath, cached.page);
  } else {
    let doc;

    try {
      doc = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainParseError) {
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

    const page = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);

    try {
      page.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      page.permalink = permalink.value;
      page.permalinkTrace = permalink.trace;

      page.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));
      page.text = doc.field('Text', validateMarkdownWithMedia);

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

    data.cache.set(plainPath, { page: page, stats: stats });
    data.pages.set(plainPath, page);
  }
};
