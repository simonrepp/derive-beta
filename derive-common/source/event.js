const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
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
      event.title = document.value('Titel', { required: true });

      const permalink = document.value('Permalink', validatePermalink, { required: true, withTrace: true });
      event.permalink = permalink.value;
      event.permalinkTrace = permalink.trace;

      event.subtitle = document.value('Untertitel');
      event.url = document.value('URL', validateAbsoluteUrl);
      event.hostReferences = document.values('Veranstalter', { withTrace: true });
      event.participantReferences = document.values('Teilnehmer', { withTrace: true });
      event.categoriesDisconnected = document.values('Kategorien');
      event.tagsDisconnected = document.values('Tags');
      event.image = document.value('Bild', validatePath);
      event.urbanize = document.value('Urbanize', validateEnum(URBANIZE_ENUM));
      event.address = document.value('Adresse');
      event.abstract = document.value('Abstract', validateMarkdown);
      event.additionalInfo = document.value('Zusatzinfo', validateMarkdown);
      event.text = document.value('Text', validateMarkdownWithMedia);

      event.dates = document.sections('Termin').map(date => ({
        date: date.value('Datum', { process: validateDate }),
        time: date.value('Zeit')
      }));

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
