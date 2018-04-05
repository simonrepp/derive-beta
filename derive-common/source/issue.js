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
  'Datum',
  'Kooperation',
  'Nummer',
  'Partner',
  'Quartal',
  'Rubrik',
  'Schwerpunkte',
  'Link zum Shop',
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
      issue.cover = validatePath(document, 'Cover', { required: true });

      validateKeys(document, specifiedKeys);

      issue.shopLink = validateString(document, 'Link zum Shop');
      issue.quarter = validateInteger(document, 'Quartal');
      issue.cooperation = validateString(document, 'Kooperation');
      issue.partners = { sourced: validateArray(document, 'Partner') };
      issue.features = validateArray(document, 'Schwerpunkte');
      issue.outOfPrint = validateBoolean(document, 'Vergriffen');
      issue.date = validateDate(document, 'Datum');
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

    // TODO: Maybe have this already in the file itself (maybe this should supersede date, if that is equivalent with quarter/year anway, or we just want a custom "3 / 2016" thing that is *not required*)
    issue.year = issue.date.getFullYear();

    data.cache.set(plainPath, { issue: issue, stats: stats });
    data.issues.set(plainPath, issue);
  }
};
