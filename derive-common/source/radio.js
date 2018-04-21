const { loadPlain, statFile } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/errors.js'),
      { validateMarkdown } = require('../validate/markdown.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.radio = cached.radio;
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.errors.push({
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const radio = { sourceFile: plainPath };

    try {
      radio.title = document.value('Titel', { required: true });
      radio.info = document.value('Allgemeine Info', validateMarkdown, { required: true });
      radio.editorReferences = document.values('Redaktion', { withTrace: true });

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataValidationError) {
        data.errors.push({
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { radio: radio, stats: stats });
    data.radio = radio;
  }
};
