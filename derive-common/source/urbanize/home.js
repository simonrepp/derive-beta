const { loadEno, statFile } = require('../../util.js');
const { EnoError } = require('enolib');

// TODO: Port simplified/DRY try/catch construct to all other loaders

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.urbanize.home = cached.home;
  } else {
    try {
      const doc = await loadEno(data.root, enoPath);

      doc.allElementsRequired();

      const home = {
        features: doc.sections('Feature').map(edition => ({
          image: edition.field('Bild').optionalPathValue(),
          link: edition.field('Link').requiredUrlValue(),
          text: edition.field('Text').requiredStringValue(),
          title: edition.field('Titel').requiredStringValue()
        })),
        sourceFile: enoPath,
        shortDescription: doc.field('Kurzbeschreibung Festival').requiredStringValue(),
        title: doc.field('Titel').requiredStringValue(),
        timeframe: doc.field('Zeitraum').requiredStringValue()
      };

      doc.assertAllTouched();

      data.cache.set(enoPath, { home, stats });
      data.urbanize.home = home;
    } catch(err) {
      if(!(err instanceof EnoError))
        throw err;

      data.cache.delete(enoPath);
      data.errors.push({
        files: [{ path: enoPath, selection: err.selection }],
        message: err.text,
        snippet: err.snippet
      });
    }
  }
};
