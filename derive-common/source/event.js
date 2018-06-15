const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateDate = require('../validate/date.js'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

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

      if(err instanceof EnoParseError) {
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
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      event.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      event.permalink = permalink.value;
      event.permalinkElement = permalink.element;

      event.subtitle = doc.field('Untertitel');
      event.url = doc.field('URL', validateAbsoluteUrl);
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
        date: date.field('Datum', { process: validateDate }),
        time: date.field('Zeit')
      }));

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof EnoValidationError) {
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
