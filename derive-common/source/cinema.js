const { loadEno, statFile } = require('../util.js');
const { ParseError, ValidationError  } = require('enojs');
const { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');

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

    doc.enforceAllElements();

    try {
      cinema.title = doc.string('Titel', { required: true });
      cinema.subtitle = doc.string('Untertitel', { required: true });
      cinema.image = doc.field('Bild', validatePath, { required: true });
      cinema.description = doc.field('Allgemeine Info', validateMarkdown, { required: true });
      cinema.externalLink = doc.url('Filmcasino Link', { required: true });

      cinema.dates = doc.sections('Termin').map(date => ({
        abstract: date.field('Kurztext [Markdown]', validateMarkdown, { required: true }),
        date: date.datetime('Datum', { required: true }),
        filmMeta: date.string('Filminfo', { required: true }),
        eventMeta: date.field('Veranstaltungsinfo [Markdown]', validateMarkdown, { required: true }),
        image: date.field('Bild', validatePath, { required: true }),
        link: date.url('Link', { required: true }),
        text: date.field('Langtext [Markdown+Medien]', validateMarkdownWithMedia, { required: true }),
        time: date.string('Zeit', { required: true }),
        title: date.string('Titel', { required: true })
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
