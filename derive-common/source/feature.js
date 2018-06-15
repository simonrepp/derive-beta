const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.features.set(enoPath, cached.feature);
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

    const feature = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      feature.title = doc.field('Titel', { required: true });
      feature.header = doc.field('Header');
      feature.image = doc.field('Bild', validatePath);
      feature.position = doc.field('Position', validateInteger);
      feature.biggerBox = doc.field('Größere Box', validateBoolean);
      feature.url = doc.field('URL', validateAbsoluteUrl);
      feature.text = doc.field('Text', validateMarkdown);

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

    data.cache.set(enoPath, { feature: feature, stats: stats });
    data.features.set(enoPath, feature);
  }
};
