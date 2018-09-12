const { loadEno, statFile, URBANIZE_ENUM } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const validateEnum = require('../validate/enum.js');
const { validateMarkdownWithMedia } = require('../validate/markdown.js');
const validatePermalink = require('../validate/permalink.js');

const WHITELISTED_DERIVE_PERMALINKS = [
  'impressum',
  'kooperationen',
  'medieninformationen',
  'ueber-derive'
];

const WHITELISTED_URBANIZE_PERMALINKS = [
  'festival',
  'festivalpartnerinnen',
  'festivalzentrale',
  'impressum',
  'kontakt',
  'presse',
  'radio',
  'verein',
  'zeitschrift'
];

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.pages.set(enoPath, cached.page);
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

    const page = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      page.title = doc.string('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      page.permalink = permalink.value;
      page.permalinkElement = permalink.element;

      page.urbanize = doc.field('Urbanize', validateEnum(URBANIZE_ENUM));

      if(page.urbanize === null && !WHITELISTED_DERIVE_PERMALINKS.includes(page.permalink)) {
        throw page.permalinkElement.error(`Für die derive.at Seiten sind nur die folgenden Permalinks explizit vorgesehen: ${WHITELISTED_DERIVE_PERMALINKS.map(permalink => `'${permalink}'`).join(', ')}`);
      }

      if(page.urbanize !== null && !WHITELISTED_URBANIZE_PERMALINKS.includes(page.permalink)) {
        throw page.permalinkElement.error(`Für die urbanize.at Seiten sind nur die folgenden Permalinks explizit vorgesehen: ${WHITELISTED_URBANIZE_PERMALINKS.map(permalink => `'${permalink}'`).join(', ')}`);
      }

      page.text = doc.field('Text', validateMarkdownWithMedia, { required: true });

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
    data.pages.set(enoPath, page);
  }
};
