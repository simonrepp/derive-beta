const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const { validateMarkdown } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.festival = cached.festival;
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

    const festival = { sourceFile: enoPath };

    doc.enforceAllElements();

    try {
      festival.title = doc.field('Titel', { required: true });
      festival.subtitle = doc.field('Untertitel', { required: true });
      festival.image = doc.field('Bild', validatePath, { required: true });
      festival.description = doc.field('Beschreibung', validateMarkdown, { required: true });
      festival.editions = doc.sections('Edition').map(edition => ({
        image: edition.field('Bild', validatePath, { required: true }),
        url: edition.url('URL', { required: true })
      }));

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

    data.cache.set(enoPath, { festival: festival, stats: stats });
    data.festival = festival;
  }
};
