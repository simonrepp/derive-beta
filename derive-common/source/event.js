const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const validateEnum = require('../validate/enum.js');
const { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');
const validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.events.set(enoPath, cached.event);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
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

    const event = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      event.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      event.permalink = permalink.value;
      event.permalinkElement = permalink.element;

      event.subtitle = doc.field('Untertitel');
      event.url = doc.url('URL');
      event.hostReferences = doc.list('Veranstalter', { withElements: true });
      event.participantReferences = doc.list('Teilnehmer', { withElements: true });
      event.categoriesDisconnected = doc.list('Kategorien');
      event.tagsDisconnected = doc.list('Tags');
      event.image = doc.field('Bild', validatePath);
      event.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));
      event.address = doc.field('Adresse');
      event.abstract = doc.field('Abstract', validateMarkdown);
      event.additionalInfo = doc.field('Zusatzinfo', validateMarkdown);
      event.text = doc.field('Text', validateMarkdownWithMedia);

      event.dates = doc.sections('Termin').map(date => ({
        date: date.datetime('Datum'),
        time: date.field('Zeit')
      }));

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

    data.cache.set(enoPath, { event: event, stats: stats });
    data.events.set(enoPath, event);
  }
};
