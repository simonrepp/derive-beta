const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateDate,
        validateKeys,
        validateEnum,
        validateMarkdown,
        validatePath,
        validatePermalink,
        validateString,
        ValidationError } = require('../validate.js');

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
          description: `Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten einer Veranstaltung`
        });

        return;
      } else {
        throw err;
      }
    }

    const event = { sourceFile: plainPath };

    try {
      event.title = validateString(document, 'Titel', { required: true });
      event.permalink = validatePermalink(document, 'Permalink', { required: true });

      validateKeys(document, specifiedKeys);

      event.subtitle = validateString(document, 'Untertitel');
      event.url = validateString(document, 'URL');
      event.hosts = { sourced: validateArray(document, 'Veranstalter') };
      event.participants = { sourced: validateArray(document, 'Teilnehmer') };
      event.categories = { sourced: validateArray(document, 'Kategorien') };
      event.tags = { sourced: validateArray(document, 'Tags') };
      event.image = validatePath(document, 'Bild');
      event.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
      event.address = validateString(document, 'Adresse');
      event.dates = validateArray(document, 'Termin');
      event.abstract = validateMarkdown(document, 'Abstract');
      event.additionalInfo = validateMarkdown(document, 'Zusatzinfo');
      event.text = validateMarkdown(document, 'Text', { process: false });

      event.dates = event.dates.map(date => {
        const validatedDate = {};

        validatedDate.date = validateDate(date, 'Datum');
        validatedDate.time = validateString(date, 'Zeit');

        return validatedDate;
      });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${event.title ? `der Veranstaltung "${event.title}"` : 'einer Veranstaltung'}`
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
