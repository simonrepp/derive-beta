const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.pages.set(enoPath, cached.page);
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

    const page = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      page.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      page.permalink = permalink.value;
      page.permalinkElement = permalink.element;

      page.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));
      page.text = doc.field('Text', validateMarkdownWithMedia);

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

    data.cache.set(enoPath, { page: page, stats: stats });
    data.pages.set(enoPath, page);
  }
};
