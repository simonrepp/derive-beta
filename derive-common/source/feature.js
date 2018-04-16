const { loadPlainRich, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

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
      document = await loadPlainRich(data.root, plainPath);
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
      feature.title = document.value('Titel', { required: true });

      // validateKeys(document.value(specifiedKeys);

      feature.header = document.value('Header');
      feature.image = document.value('Bild', { process: validatePath });
      feature.position = document.value('Position', { process: validateInteger });
      feature.biggerBox = document.value('Größere Box', { process: validateBoolean });
      feature.url = document.value('URL', { process: validateAbsoluteUrl });
      feature.text = document.value('Text', { process: validateMarkdown });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
