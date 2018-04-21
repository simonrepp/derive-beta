const { loadPlain, statFile } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/errors.js'),
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
    let document;

    try {
      document = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataParseError) {
        data.warnings.push({
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
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

    try {
      const number = document.value('Nummer', validateInteger, { required: true, withTrace: true });
      issue.number = number.value;
      issue.numberTrace = number.trace;

      issue.title = document.value('Titel', { required: true });
      issue.year = document.value('Jahr', validateInteger, { required: true });
      issue.quarter = document.value('Quartal', validateInteger, { required: true });
      issue.cover = document.value('Cover', validatePath, { required: true });
      issue.shopLink = document.value('Link zum Shop');
      issue.cooperation = document.value('Kooperation');
      issue.features = document.values('Schwerpunkte');
      issue.outOfPrint = document.value('Vergriffen', validateBoolean);
      issue.publicationDate = document.value('Erscheinungsdatum', validateDate);
      issue.tagsDisconnected = document.values('Tags');
      issue.description = document.value('Beschreibung', validateMarkdown);

      issue.sections = document.sections('Rubrik').map(section => ({
        title: section.value('Titel', { required: true }),
        articleReferences: section.sections('Artikel', { keyRequired: false }).map(reference => {
          const title = reference.value('Titel', { required: true, withTrace: true });

          return {
            pages: reference.value('Seite(n)', { required: true }),
            title: title.value,
            titleTrace: title.trace
          };
        })
      }));

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataValidationError) {
        data.warnings.push({
          detail: err.message,
          files: [{ path: plainPath, ranges: err.ranges }],
          message: err.message,
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
