const { loadAdventure, statFile } = require('../util.js'),
      { AdventureValidationError, AdventureParseError } = require('../../adventurejs/adventure.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.festival = cached.festival;
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

    const festival = { sourceFile: plainPath };

    doc.enforcePresence(true);

    try {
      festival.title = doc.field('Titel', { required: true });
      festival.subtitle = doc.field('Untertitel', { required: true });
      festival.description = doc.field('Beschreibung', validateMarkdown, { required: true });
      festival.editions = doc.sections('Edition').map(edition => ({
        image: edition.field('Bild', validatePath, { required: true }),
        url: edition.field('URL', validateAbsoluteUrl, { required: true })
      }));

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

    data.cache.set(plainPath, { festival: festival, stats: stats });
    data.festival = festival;
  }
};
