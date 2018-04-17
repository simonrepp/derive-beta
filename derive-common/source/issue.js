const { loadPlain, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateDate = require('../validate/date.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

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
          description: 'Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: `**${plainPath}**\n\n${err.message}`,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const issue = { sourceFile: plainPath };

    try {
      issue.number = document.value('Nummer', { process: validateInteger, required: true });
      issue.title = document.value('Titel', { required: true });
      issue.year = document.value('Jahr', { process: validateInteger, required: true });
      issue.quarter = document.value('Quartal', { process: validateInteger, required: true });
      issue.cover = document.value('Cover', { process: validatePath, required: true });

      // validateKeys(document, specifiedKeys);

      issue.shopLink = document.value('Link zum Shop');
      issue.cooperation = document.value('Kooperation');
      issue.features = document.values('Schwerpunkte');
      issue.outOfPrint = document.value('Vergriffen', { process: validateBoolean });
      issue.publicationDate = document.value('Erscheinungsdatum', { process: validateDate });
      issue.tags = { sourced: document.values('Tags') };
      issue.publish = document.value('Veröffentlichen', { process: validateBoolean }); // TODO: Purpose of this? If "to test out things" we can maybe remove it because we now have staging, except long time process
      issue.description = document.value('Beschreibung', { process: validateMarkdown });

      issue.sections = document.sections('Rubrik').map(section => ({
        title: section.value('Titel', { required: true }),
        articles: {
          sourced: section.sections('Artikel', { keyRequired: false }).map(article => ({
            title: article.value('Titel', { required: true }),
            pages: article.value('Seite(n)', { required: true })
          }))
        }
      }));
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
        data.warnings.push({
          description: 'Bis zur Lösung des Problems scheint die betroffene Zeitschrift nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.',
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: `**${plainPath}**\n\n${err.message}`,
          snippet: err.snippet
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
