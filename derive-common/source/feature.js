const { loadPlain, statFile } = require('../util.js'),
      { PlainValidationError, PlainParseError } = require('../../plain/plain.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.features.set(plainPath, cached.feature);
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

    const feature = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);

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

    data.cache.set(plainPath, { feature: feature, stats: stats });
    data.features.set(plainPath, feature);
  }
};
