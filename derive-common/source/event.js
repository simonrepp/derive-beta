const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

const { loadToml } = require('../lib.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateDate,
        validateEmpty,
        validateEnum,
        validateMarkdown,
        validatePath,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.events.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten einer Veranstaltung`
    });

    return;
  }

  const event = { sourceFile: tomlPath };

  try {
    event.title = validateString(document, 'Titel', true);
    event.subtitle = validateString(document, 'Untertitel');
    event.url = validateString(document, 'URL');
    event.startDate = validateDate(document, 'Beginndatum');
    event.startTime = validateString(document, 'Beginnzeit');
    event.endDate = validateDate(document, 'Enddatum');
    event.endTime = validateString(document, 'Endzeit');
    event.hosts = validateArray(document, 'Veranstalter');
    event.participants = validateArray(document, 'Teilnehmer');
    event.categories = validateArray(document, 'Kategorien');
    event.tags = validateArray(document, 'Tags');
    event.image = validatePath(document, 'Bild', data);
    event.permalink = validateString(document, 'Permalink', true);
    event.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
    event.address = validateString(document, 'Adresse');
    event.abstract = validateMarkdown(document, 'Abstract', data);
    event.additionalInfo = validateMarkdown(document, 'Zusatzinfo', data);
    event.text = validateMarkdown(document, 'Text', data);

    validateEmpty(document);
  } catch(err) {
    data.events.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Veranstaltung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${event.title ? `der Veranstaltung "${event.title}"` : 'einer Veranstaltung'}`
    });

    return;
  }

  data.events.set(tomlPath, event);
};
