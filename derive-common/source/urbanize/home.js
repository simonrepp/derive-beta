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
        features: doc.sections('Feature').map(feature => {

          // TODO: Implement properly (after optionalFoo override fix)
          if(feature.raw().elements.length === 1) {
            return {
              eventField: feature.field('Veranstaltung'),
              eventTitle: feature.field('Veranstaltung').requiredStringValue()
            };
          }

          return {
            image: feature.field('Bild').requiredPathValue(),
            imageCredits: feature.field('Bilduntertitel').optionalStringValue(),
            link: feature.field('Link').requiredStringValue(),
            text: feature.field('Text').requiredMarkdownValue(),
            title: feature.field('Titel').requiredStringValue()
          };
        }),
        sourceFile: enoPath
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
