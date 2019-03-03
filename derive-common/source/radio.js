const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
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

    doc.allElementsRequired();

    try {
      radio.title = doc.field('Titel').requiredStringValue();
      radio.image = doc.field('Bild').requiredPathValue();
      radio.info = doc.field('Allgemeine Info').requiredMarkdownValue();
      radio.editorReferences = doc.list('Redaktion').items().map(item => ({ item, name: item.requiredStringValue() }))

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
