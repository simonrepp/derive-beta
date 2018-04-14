const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      validateArray = require('../validate/array.js'),
      validateKeys = require('../validate/keys.js'),
      validateMarkdown = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validateString = require('../validate/string.js'),
      ValidationError = require('../validate/error.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.festival = cached.festival;
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.errors.push({
          description: `Da es sich bei diesen Daten um essentielle Basisdaten der Website handelt, muss dieses Problem gelöst werden bevor wieder an der Website gearbeitet werden kann.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: '**Festival**\n\nDie Daten für die Festivalseite konnten nicht eingelesen werden.'
        });

        return;
      } else {
        throw err;
      }
    }

    const festival = { sourceFile: plainPath };

    try {
      festival.title = validateString(document, 'Titel', { required: true });
      festival.subtitle = validateString(document, 'Untertitel', { required: true });
      festival.description = validateMarkdown(document, 'Beschreibung', { required: true });

      validateKeys(document, ['Beschreibung', 'Edition', 'Titel', 'Untertitel']);

      festival.editions = validateArray(document, 'Edition');
      festival.editions = festival.editions.map(edition => {
        const validatedEdition = {};

        validatedEdition.image = validatePath(edition, 'Bild', { required: true });
        validatedEdition.url = validateAbsoluteUrl(edition, 'URL', { required: true });

        return validatedEdition;
      });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.errors.push({
          description: `Da es sich bei diesen Daten um essentielle Basisdaten der Website handelt, muss dieses Problem gelöst werden bevor wieder an der Website gearbeitet werden kann.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: '**Festival**\n\nDie Daten für die Festivalseite konnten nicht validiert werden.'
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { festival: festival, stats: stats });
    data.festival = festival;
  }
};
