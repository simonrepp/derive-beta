const { loadEno, statFile } = require('../util.js');
const { ParseError, ValidationError  } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.cinema = cached.cinema;
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

    const cinema = { sourceFile: enoPath };

    doc.allElementsRequired();

    try {
      cinema.title = doc.field('Titel').requiredStringValue();
      cinema.subtitle = doc.field('Untertitel').requiredStringValue();
      cinema.image = doc.field('Bild').requiredPathValue();
      cinema.description = doc.field('Allgemeine Info').requiredMarkdownValue();
      cinema.externalLink = doc.field('Filmcasino Link').requiredUrlValue();

      cinema.dates = doc.sections('Termin').map(date => ({
        abstract: date.field('Kurztext [Markdown]').requiredMarkdownValue(),
        date: date.field('Datum').requiredDatetimeValue(),
        filmMeta: date.field('Filminfo').requiredStringValue(),
        eventMeta: date.field('Veranstaltungsinfo [Markdown]').requiredMarkdownValue(),
        image: date.field('Bild').requiredPathValue(),
        link: date.field('Link').requiredUrlValue(),
        text: date.field('Langtext [Markdown+Medien]').requiredMarkdownWithMediaValue(),
        time: date.field('Zeit').requiredStringValue(),
        title: date.field('Titel').requiredStringValue()
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

    data.cache.set(enoPath, { cinema: cinema, stats: stats });
    data.cinema = cinema;
  }
};
