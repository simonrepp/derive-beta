const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { validateArray,
        validateBoolean,
        validateDate,
        validateKeys,
        validateInteger,
        validateMarkdown,
        validatePath,
        validateString,
        ValidationError } = require('../validate.js');

const specifiedKeys = [
  'Beschreibung',
  'Cover',
  'Erscheinungsdatum',
  'Jahr',
  'Kooperation',
  'Link zum Shop',
  'Nummer',
  'Quartal',
  'Rubrik',
  'Schwerpunkte',
  'Tags',
  'Titel',
  'Vergriffen',
  'Veröffentlichen'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.issues.set(plainPath, cached.issue);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten einer Zeitschrift`
        });

        return;
      } else {
        throw err;
      }
    }

    const issue = { sourceFile: plainPath };

    try {
      issue.number = validateInteger(document, 'Nummer', { required: true });
      issue.title = validateString(document, 'Titel', { required: true });
      issue.year = validateInteger(document, 'Jahr', { required: true });
      issue.quarter = validateInteger(document, 'Quartal', { required: true });
      issue.cover = validatePath(document, 'Cover', { required: true });

      validateKeys(document, specifiedKeys);

      issue.shopLink = validateString(document, 'Link zum Shop');
      issue.cooperation = validateString(document, 'Kooperation');
      issue.features = validateArray(document, 'Schwerpunkte');
      issue.outOfPrint = validateBoolean(document, 'Vergriffen');
      issue.publicationDate = validateDate(document, 'Erscheinungsdatum');
      issue.tags = { sourced: validateArray(document, 'Tags') };
      issue.publish = validateBoolean(document, 'Veröffentlichen'); // TODO: Purpose of this? If "to test out things" we can maybe remove it because we now have staging, except long time process
      issue.description = validateMarkdown(document, 'Beschreibung');

      issue.sections = validateArray(document, 'Rubrik');

      issue.sections = issue.sections.map(section => {
        const validatedSection = {};

        validatedSection.title = validateString(section, 'Titel', { required: true });
        validatedSection.articles = validateArray(section, 'Artikel', { optional: true });

        validatedSection.articles = validatedSection.articles.map(article => {
          const validatedArticle = {};

          validatedArticle.title = validateString(article, 'Titel', { required: true });
          validatedArticle.pages = validateString(article, 'Seite(n)', { required: true });

          return validatedArticle;
        });

        return validatedSection;
      });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${issue.number ? `der Zeitschrift #${issue.number}` : 'einer Zeitschrift'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { issue: issue, stats: stats });
    data.issues.set(plainPath, issue);
  }
};
