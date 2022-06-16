const fs = require('fs');
const path = require('path');

const { loadEno } = require('../util.js');
const { ParseError, ValidationError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = fs.statSync(path.join(data.root, enoPath));

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.programs.set(enoPath, cached.program);
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

    const program = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      program.title = doc.field('Titel').requiredStringValue();
      program.permalinkField = doc.field('Permalink');
      program.permalink = program.permalinkField.requiredPermalinkValue();
      program.firstBroadcast = doc.field('Erstausstrahlung').requiredDateValue();
      program.subtitle = doc.field('Untertitel').optionalStringValue();
      program.image = doc.field('Bild').optionalPathValue();
      program.imageCaption = doc.field('Bilduntertitel').optionalStringValue();
      program.soundfile = doc.field('Soundfile').optionalPathValue();
      program.editorReferences = doc.list('Redaktion').items().map(item => ({ item, name: item.requiredStringValue() }));
      program.language = doc.field('Sprache').optionalStringValue();
      program.categoriesDisconnected = doc.list('Kategorien').requiredStringValues();
      program.tagsDisconnected = doc.list('Tags').requiredStringValues();
      program.abstract = doc.field('Abstract').optionalMarkdownValue();
      program.text = doc.field('Text').optionalMarkdownWithMediaValue();

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

    data.cache.set(enoPath, { program: program, stats: stats });
    data.programs.set(enoPath, program);
  }
};
