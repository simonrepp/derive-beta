const { loadEno, statFile } = require('../../util.js');
const { ParseError, ValidationError } = require('enolib');

const URBANIZE_PAGE_PERMALINKS = [
  'about',
  'english',
  'impressum',
  'kontakt',
  'orte',
  'partnerinnen',
  'presse'
];

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.urbanize.pages[enoPath] = cached.page;
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

    const page = { sourceFile: enoPath };

    if(/\.entwurf\.eno$/.test(enoPath)) {
      page.draft = true;
    }

    doc.allElementsRequired();

    try {
      page.title = doc.field('Titel').requiredStringValue();
      page.permalinkField = doc.field('Permalink');
      page.permalink = page.permalinkField.requiredPermalinkValue();

      if(!URBANIZE_PAGE_PERMALINKS.includes(page.permalink))
        throw page.permalinkField.valueError(`Für die urbanize.at Seiten sind nur die folgenden Permalinks explizit vorgesehen: ${URBANIZE_PAGE_PERMALINKS.map(permalink => `'${permalink}'`).join(', ')}`);

      page.text = doc.field('Inhalt (Markdown, Medien)').requiredMarkdownWithMediaValue();

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

    data.cache.set(enoPath, { page: page, stats: stats });
    data.urbanize.pages[enoPath] = page;
  }
};
