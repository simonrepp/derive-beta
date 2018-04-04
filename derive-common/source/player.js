const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { validateArray,
        validateKeys,
        validateMarkdown,
        validateString,
        ValidationError } = require('../validate.js');

const specifiedKeys = [
  'Biographie',
  'Land',
  'Name',
  'Permalink',
  'Stadt',
  'Tags',
  'Text',
  'Website'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.players.set(plainPath, cached.player);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint der betroffene Akteur nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten eines Akteurs`
        });

        return;
      } else {
        throw err;
      }
    }

    const player = { sourceFile: plainPath };

    try {
      player.name = validateString(document, 'Name', { required: true });
      player.permalink = validateString(document, 'Permalink', { required: true });

      validateKeys(document, specifiedKeys);

      player.country = validateString(document, 'Land');
      player.city = validateString(document, 'Stadt');
      player.tags = { sourced: validateArray(document, 'Tags') };
      player.website = validateString(document, 'Website');
      player.biography = validateMarkdown(document, 'Biographie');
      player.text = validateMarkdown(document, 'Text');
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint der betroffene Akteur nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${player.name ? `des Akteurs "${player.name}"` : 'eines Akteurs'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { player: player, stats: stats });
    data.players.set(plainPath, player);
  }
};
