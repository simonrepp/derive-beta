const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');

const { loadToml } = require('../lib.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateBoolean,
        validateDate,
        validateEmpty,
        validateEnum,
        validateInteger,
        validateMarkdown,
        validatePath,
        validateString } = require('../validate.js');

module.exports = async (data, tomlPath) => {
  let document;

  try {
    document = await loadToml(data.root, tomlPath);
  } catch(err) {
    data.articles.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint der betroffene Artikel nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: `Ab Zeile ${err.line} und Spalte ${err.column} war das parsen nicht mehr möglich. Der eigentliche Fehler liegt in der Regel bereits davor, oft auch in einer vorherigen Zeile.\n \nTypische Fehlerquellen: Fehlende oder überschüssige Anführungszeichen, Beistriche, eckige Klammern.\n \nDie originale Fehlermeldung des Parsers war:\n-----------\n${err.message}`,
      files: [{
        column: err.column,
        line: err.line,
        path: tomlPath
      }],
      header: `Unkritischer Fehler beim parsen der TOML Daten eines Artikels`
    });

    return;
  }

  const article = { sourceFile: tomlPath };

  try {
    article.title = validateString(document, 'Titel', true);
    article.subtitle = validateString(document, 'Untertitel');
    article.image = validatePath(document, 'Bild', data);
    article.authors = validateArray(document, 'Autoren');
    article.date = validateString(document, 'Datum');
    article.language = validateString(document, 'Sprache');
    article.categories = validateArray(document, 'Kategorien');
    article.tags = validateArray(document, 'Tags');
    article.permalink = validateString(document, 'Permalink', true);
    article.bookReviews = validateArray(document, 'Buchbesprechungen');
    article.publish = validateBoolean(document, 'Veroeffentlichen');
    article.visible = validateBoolean(document, 'Sichtbar');
    article.issue = validateInteger(document, 'Erschienen_in_Heft');
    article.inIssueOnPage = validateString(document, 'Erschienen_auf_Seite');
    article.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
    article.abstract = validateMarkdown(document, 'Abstract', data);
    article.text = validateMarkdown(document, 'Text', data, article.title === 'Planning  Smart Cities ... ' ? true : false);
    article.bibliography = validateMarkdown(document, 'Literaturverzeichnis', data);

    validateEmpty(document);
  } catch(err) {
    data.articles.delete(tomlPath);

    data.warnings.push({
      description: `Bis zur Lösung des Problems scheint der betroffene Artikel nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${tomlPath}`,
      detail: err,
      files: [{ path: tomlPath }],
      header: `Unkritischer Fehler beim prüfen der Daten ${article.title ? `des Artikels "${article.title}"` : 'eines Artikels'}`
    });

    return;
  }

  data.articles.set(tomlPath, article);
};
