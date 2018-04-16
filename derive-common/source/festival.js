const { loadPlainRich, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.festival = cached.festival;
  } else {
    let document;

    try {
      document = await loadPlainRich(data.root, plainPath);
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
      festival.title = document.value('Titel', { required: true });
      festival.subtitle = document.value('Untertitel', { required: true });
      festival.description = document.value('Beschreibung', { process: validateMarkdown, required: true });

      // validateKeys(document, ['Beschreibung', 'Edition', 'Titel', 'Untertitel']);

      festival.editions = document.sections('Edition').map(edition => ({
        image: edition.value('Bild', { process: validatePath, required: true }),
        url: edition.value('URL', { process: validateAbsoluteUrl, required: true })
      }));
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
