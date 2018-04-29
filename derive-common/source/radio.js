const { loadAdventure, statFile } = require('../util.js'),
      { AdventureValidationError, AdventureParseError } = require('../../adventurejs/adventure.js'),
      { validateMarkdown } = require('../validate/markdown.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.radio = cached.radio;
  } else {
    let doc;

    try {
      doc = await loadAdventure(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof AdventureParseError) {
        data.errors.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const radio = { sourceFile: plainPath };

    doc.enforcePresence(true);

    try {
      radio.title = doc.field('Titel', { required: true });
      radio.info = doc.field('Allgemeine Info', validateMarkdown, { required: true });
      radio.editorReferences = doc.list('Redaktion', { withTrace: true });

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof AdventureValidationError) {
        data.errors.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
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
