const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

const { loadToml } = require('../lib.js'), // TODO: util.js instead ?
      { validateArray,
        validateDate,
        validateEmpty,
        validateMarkdown,
        validatePath,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.programs.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Radiosendung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten einer Radiosendung`
    });

    return;
  }

  const program = { sourceFile: tomlPath };

  try {
    program.title = validateString(document, 'Titel', true);
    program.subtitle = validateString(document, 'Untertitel');
    program.image = validatePath(document, 'Bild', data);
    program.soundfile = validatePath(document, 'Soundfile', data);
    program.editors = validateArray(document, 'Redaktion');
    program.firstBroadcast = validateDate(document, 'Erstausstrahlung', true);
    program.language = validateString(document, 'Sprache');
    program.categories = validateArray(document, 'Kategorien');
    program.tags = validateArray(document, 'Tags');
    program.permalink = validateString(document, 'Permalink', true);
    program.abstract = validateMarkdown(document, 'Abstract', data);
    program.text = validateMarkdown(document, 'Text', data);

    validateEmpty(document);
  } catch(err) {
    data.programs.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Radiosendung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${program.title ? `der Radiosendung "${program.title}"` : 'einer Radiosendung'}`
    });

    return;
  }

  data.programs.set(tomlPath, program);
};
