const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      validateArray = require('../validate/array.js'),
      validateKeys = require('../validate/keys.js'),
      validateMarkdown = require('../validate/markdown.js'),
      validateString = require('../validate/string.js'),
      ValidationError = require('../validate/error.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.radio = cached.radio;
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
          header: '**Radio**\n\nDie Daten für die allgemeinen Radio Informationen konnten nicht eingelesen werden.'
        });

        return;
      } else {
        throw err;
      }
    }

    const radio = { sourceFile: plainPath };

    try {
      radio.title = validateString(document, 'Titel', { required: true });
      radio.info = validateMarkdown(document, 'Allgemeine Info', { required: true });
      radio.editors = { sourced: validateArray(document, 'Redaktion') };

      validateKeys(document, ['Allgemeine Info', 'Redaktion', 'Titel']);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.errors.push({
          description: `Da es sich bei diesen Daten um essentielle Basisdaten der Website handelt, muss dieses Problem gelöst werden bevor wieder an der Website gearbeitet werden kann.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{ path: plainPath }],
          header: '**Radio**\n\nDie Daten für die allgemeinen Radio Informationen konnten nicht validiert werden.'
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { radio: radio, stats: stats });
    data.radio = radio;
  }
};
