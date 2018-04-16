const { loadPlainRich, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateDate = require('../validate/date.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

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
      document = await loadPlainRich(data.root, plainPath);
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
      program.title = document.value('Titel', { required: true });
      program.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      program.firstBroadcast = document.value('Erstausstrahlung', { process: validateDate, required: true });

      // validateKeys(document, specifiedKeys);

      program.subtitle = document.value('Untertitel');
      program.image = document.value('Bild', { process: validatePath });
      program.soundfile = document.value('Soundfile', { process: validatePath });
      program.editors = { sourced: document.values('Redaktion') };
      program.language = document.value('Sprache');
      program.categories = { sourced: document.values('Kategorien') };
      program.tags = { sourced: document.values('Tags') };
      program.abstract = document.value('Abstract', { process: validateMarkdown });
      program.text = document.value('Text', { process: validateMarkdownWithMedia });
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
