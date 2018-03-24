const path = require('path');

const { loadToml } = require('../lib.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateEmpty,
        validateEnum,
        validateMarkdown,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.pages.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Seite nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten einer Seite`
    });

    return;
  }

  const page = { sourceFile: tomlPath };

  try {
    page.title = validateString(document, 'Titel', true);
    page.permalink = validateString(document, 'Permalink', true);
    page.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
    page.text = validateMarkdown(document, 'Text', data);

    validateEmpty(document);
  } catch(err) {
    data.pages.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Seite nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${page.name ? `der Seite "${page.name}"` : 'einer Seite'}`
    });

    return;
  }

  data.pages.set(tomlPath, page);
};
