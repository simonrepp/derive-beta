const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

const { loadToml } = require('../lib.js'),
      { validateArray,
        validateBoolean,
        validateDate,
        validateEmpty,
        validateInteger,
        validateMarkdown,
        validatePath,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.issues.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten einer Zeitschrift`
    });

    return;
  }

  const issue = { sourceFile: tomlPath };

  try {
    issue.number = validateInteger(document, 'Nummer');
    issue.quarter = validateString(document, 'Quartal');
    issue.title = validateString(document, 'Titel', true);
    issue.cover = validatePath(document, 'Cover', data);
    issue.cooperation = validateString(document, 'Kooperation');
    issue.partners = validateArray(document, 'Partner');
    issue.features = validateArray(document, 'Schwerpunkte');
    issue.outOfPrint = validateBoolean(document, 'Vergriffen');
    issue.date = validateDate(document, 'Datum');
    issue.tags = validateArray(document, 'Tags');
    issue.publish = validateBoolean(document, 'Veroeffentlichen');
    issue.description = validateMarkdown(document, 'Beschreibung', data);

    issue.sections = validateArray(document, 'Rubrik');

    issue.sections = issue.sections.map(section => {
      const validatedSection = {};

      try {
        validatedSection.title = validateString(section, 'Titel');
        validatedSection.articles = validateArray(section, 'Artikel');

        validateEmpty(section);
      } catch(err) {
        throw `Fehler in einer Rubrik - ${err}`;
      }

      return validatedSection;
    });

    validateEmpty(document);
  } catch(err) {
    data.issues.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${issue.number ? `der Zeitschrift #${issue.number}` : 'einer Zeitschrift'}`
    });

    return;
  }

  // TODO: Maybe have this already in the file itself (maybe this should supersede date, if that is equivalent with quarter/year anway, or we just want a custom "3 / 2016" thing that is *not required*)
  issue.year = issue.date.substr(0, 4);

  data.issues.set(tomlPath, issue);
};
