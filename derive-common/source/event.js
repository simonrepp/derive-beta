const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/plaindata.js'),
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
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
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

    try {
      event.title = document.attribute('Titel', { required: true });

      const permalink = document.attribute('Permalink', validatePermalink, { required: true, withTrace: true });
      event.permalink = permalink.value;
      event.permalinkTrace = permalink.trace;

      event.subtitle = document.attribute('Untertitel');
      event.url = document.attribute('URL', validateAbsoluteUrl);
      event.hostReferences = document.list('Veranstalter', { withTrace: true });
      event.participantReferences = document.list('Teilnehmer', { withTrace: true });
      event.categoriesDisconnected = document.list('Kategorien');
      event.tagsDisconnected = document.list('Tags');
      event.image = document.attribute('Bild', validatePath);
      event.urbanize = document.attribute('Urbanize', validateEnum(URBANIZE_ENUM));
      event.address = document.attribute('Adresse');
      event.abstract = document.attribute('Abstract', validateMarkdown);
      event.additionalInfo = document.attribute('Zusatzinfo', validateMarkdown);
      event.text = document.attribute('Text', validateMarkdownWithMedia);

      event.dates = document.sections('Termin').map(date => ({
        date: date.attribute('Datum', { process: validateDate }),
        time: date.attribute('Zeit')
      }));

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataValidationError) {
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
