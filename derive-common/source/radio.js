const { loadEno, statFile } = require('../util.js'),
      { ValidationError, ParseError } = require('enojs'),
      { validateMarkdown } = require('../validate/markdown.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.radio = cached.radio;
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ParseError) {
        data.errors.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const radio = { sourceFile: enoPath };

    doc.enforceAllElements();

    try {
      radio.title = doc.field('Titel', { required: true });
      radio.info = doc.field('Allgemeine Info', validateMarkdown, { required: true });
      radio.editorReferences = doc.list('Redaktion', { withElements: true });

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ValidationError) {
        data.errors.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(enoPath, { radio: radio, stats: stats });
    data.radio = radio;
  }
};
