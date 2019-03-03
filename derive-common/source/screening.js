const { loadEno, statFile } = require('../util.js');
const { ParseError, ValidationError  } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.screenings.set(enoPath, cached.screening);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(error) {
      data.cache.delete(enoPath);

      if(error instanceof ParseError) {
        data.errors.push({
          files: [{ path: enoPath, selection: error.selection }],
          message: error.text,
          snippet: error.snippet
        });

        return;
      } else {
        throw error;
      }
    }

    const screening = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      screening.title = doc.field('Titel').requiredStringValue();
      screening.permalinkField = doc.field('Permalink');
      screening.permalink = screening.permalinkField.requiredPermalinkValue();
      screening.abstract = doc.field('Kurztext [Markdown]').requiredMarkdownValue();
      screening.date = doc.field('Datum').requiredDatetimeValue();
      screening.filmMeta = doc.field('Filminfo').requiredStringValue();
      screening.eventMeta = doc.field('Veranstaltungsinfo [Markdown]').requiredMarkdownValue();
      screening.image = doc.field('Bild').requiredPathValue();
      screening.link = doc.field('Link').requiredUrlValue();
      screening.text = doc.field('Langtext [Markdown+Medien]').requiredMarkdownWithMediaValue();
      screening.time = doc.field('Zeit').requiredStringValue();

      doc.assertAllTouched();
    } catch(error) {
      data.cache.delete(enoPath);

      if(error instanceof ValidationError) {
        data.errors.push({
          files: [{ path: enoPath, selection: error.selection }],
          message: error.text,
          snippet: error.snippet
        });

        return;
      } else {
        throw error;
      }
    }

    data.cache.set(enoPath, { screening: screening, stats: stats });
    data.screenings.set(enoPath, screening);
  }
};
