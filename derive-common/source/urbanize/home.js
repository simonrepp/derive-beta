const { loadEno, statFile } = require('../../util.js');
const { EnoError, ValidationError } = require('enolib');

// TODO: Port simplified/DRY try/catch construct to all other loaders

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  data.urbanize.home = {
    features: [],
    sourceFile: enoPath
  };

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.urbanize.home.features = cached.features;
  } else {
    try {
      const doc = await loadEno(data.root, enoPath);

      doc.allElementsRequired();

      let failures = 0;
      for(const feature of doc.sections('Feature')) {
        try {
          // TODO: Implement properly (after optionalFoo override fix)
          if(feature.raw().elements.length === 1) {
            data.urbanize.home.features.push({
              eventField: feature.field('Veranstaltung'),
              eventTitle: feature.field('Veranstaltung').requiredStringValue()
            });
          } else {
            data.urbanize.home.features.push({
              image: feature.field('Bild').requiredPathValue(),
              imageCredits: feature.field('Bilduntertitel').optionalStringValue(),
              link: feature.field('Link').requiredStringValue(),
              text: feature.field('Text').requiredMarkdownValue(),
              title: feature.field('Titel').requiredStringValue()
            });
          }
        } catch(err) {
          if(!(err instanceof ValidationError))
            throw err;

          failures += 1;

          data.warnings.push({
            files: [{ path: enoPath, selection: err.selection }],
            message: err.text,
            snippet: err.snippet
          });
        }
      }

      if(failures > 0) {
        data.cache.delete(enoPath);
      } else {
        doc.assertAllTouched();
        data.cache.set(enoPath, { features: data.urbanize.home.features, stats });
      }
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
