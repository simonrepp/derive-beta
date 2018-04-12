const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateInteger = require('../validate/integer.js'),
      validateKeys = require('../validate/keys.js'),
      validateMarkdown = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validateString = require('../validate/string.js'),
      ValidationError = require('../validate/error.js');

const specifiedKeys = [
  'Bild',
  'Größere Box',
  'Header',
  'Position',
  'Text',
  'Titel',
  'URL'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.features.set(plainPath, cached.feature);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das betroffene Feature nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der Plain Data Daten eines Features`
        });

        return;
      } else {
        throw err;
      }
    }

    const feature = { sourceFile: plainPath };

    try {
      feature.title = validateString(document, 'Titel', { required: true });

      validateKeys(document, specifiedKeys);

      feature.header = validateString(document, 'Header');
      feature.image = validatePath(document, 'Bild');
      feature.position = validateInteger(document, 'Position');
      feature.biggerBox = validateBoolean(document, 'Größere Box');
      feature.url = validateAbsoluteUrl(document, 'URL');
      feature.text = validateMarkdown(document, 'Text');
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint das betroffene Feature nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${feature.title ? `des Features "${feature.title}"` : 'eines Features'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { feature: feature, stats: stats });
    data.features.set(plainPath, feature);
  }
};
