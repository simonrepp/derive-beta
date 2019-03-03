const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const validateBoolean = require('../validate/boolean.js');
const { validateMarkdown } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');

const ISSUE_REGEXP = /^\d+(?:\/\d+)?$/;
const PAGES_REGEXP = /^\d{2,3}(?:-\d{2,3})?(?:, \d{2,3}(?:-\d{2,3})?)?$|^Nur online$/;

const validateIssueNumber = ({ name, value }) => {
  if(!value.match(ISSUE_REGEXP)) {
    throw `${name} muss eine Ganzzahl, bzw. bei Doppelausgaben zwei durch '/' getrennte Ganzzahlen enthalten, zum Beispiel '13' oder '40/41'`;
  }

  return value;
};

const validatePages = ({ name, value }) => {
  if(!value.match(PAGES_REGEXP)) {
    throw `Erlaubte Formate für Seitenangaben sind: "01" / "13-14" / "23-42, 57-89" / "Nur online" `;
  }

  return value;
};

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

    doc.enforceAllElements();

    try {
      const number = doc.field('Nummer', validateIssueNumber, { required: true, withElement: true });
      issue.number = number.value;
      issue.numberElement = number.element;
      issue.permalink = number.value.replace('/', '-');

      issue.title = doc.string('Titel', { required: true });
      issue.year = doc.number('Jahr', { required: true });
      issue.quarter = doc.number('Quartal', { required: true });
      issue.cover = doc.field('Cover', validatePath, { required: true });
      issue.shopLink = doc.url('Link zum Shop', { required: true });
      issue.cooperation = doc.string('Kooperation');
      issue.features = doc.list('Schwerpunkte');
      issue.outOfPrint = doc.field('Vergriffen', validateBoolean);
      issue.tagsDisconnected = doc.list('Tags');
      issue.description = doc.field('Beschreibung', validateMarkdown);

      issue.sections = doc.sections('Rubrik').map(section => ({
        title: section.string('Titel', { required: true }),
        articleReferences: section.sections('Artikel').map(reference => {
          const title = reference.string('Titel', { required: true, withElement: true });

          return {
            pages: reference.field('Seite(n)', validatePages, { required: true }),
            title: title.value,
            titleElement: title.element
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
