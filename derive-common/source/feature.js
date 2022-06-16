const fs = require('fs');
const path = require('path');

const { loadEno } = require('../util.js');
const { ParseError, ValidationError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = fs.statSync(path.join(data.root, enoPath));

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.features.set(enoPath, cached.feature);
  } else {
    let doc;

    try {
      doc = loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ParseError) {
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
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      feature.title = doc.field('Titel').requiredStringValue();
      feature.header = doc.field('Header').optionalStringValue();
      feature.image = doc.field('Bild').optionalPathValue();
      feature.position = doc.field('Position').optionalIntegerValue();
      feature.type = doc.field('Typ').requiredFeatureTypeValue();
      feature.url = doc.field('URL').optionalUrlValue();
      feature.text = doc.field('Text').optionalMarkdownValue();

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ValidationError) {
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
