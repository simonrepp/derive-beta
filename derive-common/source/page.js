const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateKeys,
        validateEnum,
        validateMarkdown,
        validatePermalink,
        validateString,
        ValidationError } = require('../validate.js');

const specifiedKeys = [
  'Permalink',
  'Text',
  'Titel',
  'Urbanize'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.pages.set(plainPath, cached.page);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Seite nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten einer Seite`
        });

        return;
      } else {
        throw err;
      }
    }

    const page = { sourceFile: plainPath };

    try {
      page.title = validateString(document, 'Titel', { required: true });
      page.permalink = validatePermalink(document, 'Permalink', { required: true });

      validateKeys(document, specifiedKeys);

      page.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
      page.text = validateMarkdown(document, 'Text', { process: false });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Seite nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${page.name ? `der Seite "${page.name}"` : 'einer Seite'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { page: page, stats: stats });
    data.pages.set(plainPath, page);
  }
};
