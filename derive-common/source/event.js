const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainValidationError, PlainParseError } = require('../../plain/plain.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateDate = require('../validate/date.js'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.events.set(plainPath, cached.event);
  } else {
    let doc;

    try {
      doc = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainParseError) {
        data.warnings.push({
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const event = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);
    
    try {
      event.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      event.permalink = permalink.value;
      event.permalinkTrace = permalink.trace;

      event.subtitle = doc.field('Untertitel');
      event.url = doc.field('URL', validateAbsoluteUrl);
      event.hostReferences = doc.list('Veranstalter', { withTrace: true });
      event.participantReferences = doc.list('Teilnehmer', { withTrace: true });
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
      data.cache.delete(plainPath);

      if(err instanceof PlainValidationError) {
        data.warnings.push({
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { event: event, stats: stats });
    data.events.set(plainPath, event);
  }
};
