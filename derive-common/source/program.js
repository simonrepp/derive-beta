const { loadPlain, statFile } = require('../util.js'),
      { PlainDataParseError } = require('../../plaindata/plaindata.js'),
      validateArray = require('../validate/array.js'),
      validateDate = require('../validate/date.js'),
      validateKeys = require('../validate/keys.js'),
      validateMarkdown = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js'),
      validateString = require('../validate/string.js'),
      ValidationError = require('../validate/error.js');

const specifiedKeys = [
  'Abstract',
  'Bild',
  'Erstausstrahlung',
  'Kategorien',
  'Permalink',
  'Redaktion',
  'Soundfile',
  'Sprache',
  'Tags',
  'Text',
  'Titel',
  'Untertitel'
];

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.programs.set(plainPath, cached.program);
  } else {
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Radiosendung nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${plainPath}`,
          detail: err.message,
          files: [{
            beginColumn: err.beginColumn,
            beginLine: err.beginLine,
            column: err.column,
            line: err.line,
            path: plainPath
          }],
          header: `Problem gefunden beim einlesen der plaindata Daten einer Radiosendung`
        });

        return;
      } else {
        throw err;
      }
    }

    const program = { sourceFile: plainPath };

    try {
      program.title = validateString(document, 'Titel', { required: true });
      program.permalink = validatePermalink(document, 'Permalink', { required: true });
      program.firstBroadcast = validateDate(document, 'Erstausstrahlung', { required: true });

      validateKeys(document, specifiedKeys);

      program.subtitle = validateString(document, 'Untertitel');
      program.image = validatePath(document, 'Bild');
      program.soundfile = validatePath(document, 'Soundfile');
      program.editors = { sourced: validateArray(document, 'Redaktion') };
      program.language = validateString(document, 'Sprache'); // TODO: What is the usecase of this actually? (same for articles)
      program.categories = { sourced: validateArray(document, 'Kategorien') };
      program.tags = { sourced: validateArray(document, 'Tags') };
      program.abstract = validateMarkdown(document, 'Abstract');
      program.text = validateMarkdown(document, 'Text', { media: true });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          description: 'Bis der Fehler korrigiert wurde wird die Datei ignoriert, dies kann auch weitere Dateien betreffen wenn diese auf die Datei bzw. deren Inhalte referenzieren.',
          detail: err.message,
          files: [{ path: plainPath }],
          header: `**${plainPath}**\n\nProblem: Die Daten ${program.title ? `der Radiosendung "${program.title}"` : 'einer Radiosendung'} konnten nicht erfolgreich validiert werden.`
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { program: program, stats: stats });
    data.programs.set(plainPath, program);
  }
};
