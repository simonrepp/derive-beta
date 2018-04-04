const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      { URBANIZE_ENUM,
        validateArray,
        validateBoolean,
        validateDate,
        validateKeys,
        validateEnum,
        validateInteger,
        validateMarkdown,
        validatePath,
        validateString,
        ValidationError } = require('../validate.js');

const specifiedKeys = [
  'Abstract',
  'Autoren',
  'Bild',
  'Buchbesprechungen',
  'Datum',
  'Kategorien',
  'Literaturverzeichnis',
  'Permalink',
  'Sichtbar',
  'Sprache',
  'Tags',
  'Text',
  'Titel',
  'Untertitel',
  'Urbanize',
  'Veröffentlichen'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.articles.set(plainPath, cached.article);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint der betroffene Artikel nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten eines Artikels`
        });

        return;
      } else {
        throw err;
      }
    }

    const article = { sourceFile: plainPath };

    try {

      article.title = validateString(document, 'Titel', { required: true });
      article.permalink = validateString(document, 'Permalink', { required: true });

      validateKeys(document, specifiedKeys);

      article.subtitle = validateString(document, 'Untertitel');
      article.image = validatePath(document, 'Bild');
      article.authors = { sourced: validateArray(document, 'Autoren') };
      article.date = validateString(document, 'Datum');
      article.language = validateString(document, 'Sprache');
      article.categories = { sourced: validateArray(document, 'Kategorien') };
      article.tags = { sourced: validateArray(document, 'Tags') };
      article.bookReviews = { sourced: validateArray(document, 'Buchbesprechungen') };
      article.publish = validateBoolean(document, 'Veröffentlichen');
      article.visible = validateBoolean(document, 'Sichtbar');
      article.urbanize = validateEnum(document, 'Urbanize', URBANIZE_ENUM);
      article.abstract = validateMarkdown(document, 'Abstract');
      article.bibliography = validateMarkdown(document, 'Literaturverzeichnis');
      article.text = validateMarkdown(document, 'Text', { process: false });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint der betroffene Artikel nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: `Problem gefunden beim prüfen der Daten ${article.title ? `des Artikels "${article.title}"` : 'eines Artikels'}`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { article: article, stats: stats });
    data.articles.set(plainPath, article);
  }
};
