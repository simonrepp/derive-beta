const { loadPlain, statFile, URBANIZE_ENUM } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateDate = require('../validate/date.js'),
      validateEnum = require('../validate/enum.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

const specifiedKeys = [
  'Abstract',
  'Adresse',
  'Bild',
  'Kategorien',
  'Permalink',
  'Tags',
  'Teilnehmer',
  'Termin',
  'Text',
  'Titel',
  'Untertitel',
  'Urbanize',
  'URL',
  'Veranstalter',
  'Zusatzinfo'
];

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
          description: 'Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: `**${plainPath}**\n\n${err.message}`,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const event = { sourceFile: plainPath };

    try {
      event.title = document.value('Titel', { required: true });
      event.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      event.permalinkMeta = document.meta('Permalink');

      // validateKeys(document.value(specifiedKeys);

      event.subtitle = document.value('Untertitel');
      event.url = document.value('URL', { process: validateAbsoluteUrl });
      event.hosts = { sourced: document.values('Veranstalter') };
      event.participants = { sourced: document.values('Teilnehmer') };
      event.categories = { sourced: document.values('Kategorien') };
      event.tags = { sourced: document.values('Tags') };
      event.image = document.value('Bild', { process: validatePath });
      event.urbanize = document.value('Urbanize', { process: validateEnum(URBANIZE_ENUM) });
      event.address = document.value('Adresse');
      event.abstract = document.value('Abstract', { process: validateMarkdown });
      event.additionalInfo = document.value('Zusatzinfo', { process: validateMarkdown });
      event.text = document.value('Text', { process: validateMarkdownWithMedia });

      event.dates = document.sections('Termin').map(date => ({
        date: date.value('Datum', { process: validateDate }),
        time: date.value('Zeit')
      }));
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
        data.warnings.push({
          description: 'Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: `**${plainPath}**\n\n${err.message}`,
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
