const { loadAdventure, statFile } = require('../util.js'),
      { AdventureValidationError, AdventureParseError } = require('../../adventurejs/adventure.js'),
      validateBoolean = require('../validate/boolean.js'),
      validateDate = require('../validate/date.js'),
      validateInteger = require('../validate/integer.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.issues.set(plainPath, cached.issue);
  } else {
    let doc;

    try {
      doc = await loadAdventure(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof AdventureParseError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const issue = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);

    try {
      const number = doc.field('Nummer', validateInteger, { required: true, withTrace: true });
      issue.number = number.value;
      issue.numberTrace = number.trace;

      issue.title = doc.field('Titel', { required: true });
      issue.year = doc.field('Jahr', validateInteger, { required: true });
      issue.quarter = doc.field('Quartal', validateInteger, { required: true });
      issue.cover = doc.field('Cover', validatePath, { required: true });
      issue.shopLink = doc.field('Link zum Shop');
      issue.cooperation = doc.field('Kooperation');
      issue.features = doc.list('Schwerpunkte');
      issue.outOfPrint = doc.field('Vergriffen', validateBoolean);
      issue.publicationDate = doc.field('Erscheinungsdatum', validateDate);
      issue.tagsDisconnected = doc.list('Tags');
      issue.description = doc.field('Beschreibung', validateMarkdown);

      issue.sections = doc.sections('Rubrik').map(section => ({
        title: section.field('Titel', { required: true }),
        articleReferences: section.sections('Artikel').map(reference => {
          const title = reference.field('Titel', { required: true, withTrace: true });

          return {
            pages: reference.field('Seite(n)', { required: true }),
            title: title.value,
            titleTrace: title.trace
          };
        })
      }));

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof AdventureValidationError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
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
