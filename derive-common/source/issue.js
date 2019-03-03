const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.issues.set(enoPath, cached.issue);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ParseError) {
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
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      issue.numberField = doc.field('Nummer');
      issue.number = issue.numberField.requiredIssueNumberValue();
      issue.permalink = issue.number.replace('/', '-');
      issue.title = doc.field('Titel').requiredStringValue();
      issue.year = doc.field('Jahr').requiredIntegerValue();
      issue.quarter = doc.field('Quartal').requiredIntegerValue();
      issue.cover = doc.field('Cover').requiredPathValue();
      issue.shopLink = doc.field('Link zum Shop').requiredUrlValue();
      issue.cooperation = doc.field('Kooperation').optionalStringValue();
      issue.features = doc.list('Schwerpunkte').requiredStringValues();
      issue.outOfPrint = doc.field('Vergriffen').requiredBooleanValue();
      issue.tagsDisconnected = doc.list('Tags').requiredStringValues();
      issue.description = doc.field('Beschreibung').optionalMarkdownValue();

      issue.sections = doc.sections('Rubrik').map(section => ({
        title: section.field('Titel').requiredStringValue(),
        articleReferences: section.sections('Artikel').map(articleReference => {
          const titleField = articleReference.field('Titel');
          const title = titleField.requiredStringValue();

          return {
            pages: articleReference.field('Seite(n)').requiredPagesInfoValue(),
            title,
            titleField
          };
        })
      }));

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ValidationError) {
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
