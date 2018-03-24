const path = require('path');

const { loadToml } = require('../lib.js'),
      { validateArray,
        validateEmpty,
        validateMarkdown,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.players.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint der betroffene Akteur nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten eines Akteurs`
    });

    return;
  }

  const player = { sourceFile: tomlPath };

  try {
    player.name = validateString(document, 'Name', true);
    player.country = validateString(document, 'Land');
    player.city = validateString(document, 'Stadt');
    player.tags = validateArray(document, 'Tags');
    player.website = validateString(document, 'Website');
    player.permalink = validateString(document, 'Permalink', true);
    player.biography = validateMarkdown(document, 'Biographie', data);
    player.text = validateMarkdown(document, 'Text', data);

    validateEmpty(document);
  } catch(err) {
    data.players.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint der betroffene Akteur nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${player.name ? `des Akteurs "${player.name}"` : 'eines Akteurs'}`
    });

    return;
  }

  data.players.set(tomlPath, player);
};
