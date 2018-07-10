const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateBoolean = require('../validate/boolean.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.issues.set(enoPath, cached.issue);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof EnoParseError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const issue = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      const number = doc.number('Nummer', { required: true, withElement: true });
      issue.number = number.value;
      issue.numberElement = number.element;

      issue.title = doc.field('Titel', { required: false }) || 'TODO: Titel ausfuellen';   // TODO: Reset to true, changed for dev
      issue.year = doc.number('Jahr', { required: true });
      issue.quarter = doc.number('Quartal', { required: true });
      issue.cover = doc.field('Cover', validatePath, { required: true });
      issue.shopLink = doc.field('Link zum Shop', { required: false }) || 'TODO: Titel ausfuellen';  // TODO: Reset to true, changed for dev
      issue.cooperation = doc.field('Kooperation');
      issue.features = doc.list('Schwerpunkte');
      issue.outOfPrint = doc.field('Vergriffen', validateBoolean);
      issue.publicationDate = doc.date('Erscheinungsdatum');
      issue.tagsDisconnected = doc.list('Tags');
      issue.description = doc.field('Beschreibung', validateMarkdown);

      issue.sections = doc.sections('Rubrik').map(section => ({
        title: section.field('Titel', { required: true }),
        articleReferences: section.sections('Artikel').map(reference => {
          const title = reference.field('Titel', { required: true, withElement: true });

          return {
            pages: reference.field('Seite(n)', { required: true }),
            title: title.value,
            titleElement: title.element
          };
        })
      }));

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof EnoValidationError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(enoPath, { issue: issue, stats: stats });
    data.issues.set(enoPath, issue);
  }
};
