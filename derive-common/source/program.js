const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enojs');
const { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js');
const validatePath = require('../validate/path.js');
const validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.programs.set(enoPath, cached.program);
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

    const program = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.enforceAllElements();

    try {
      program.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withElement: true });
      program.permalink = permalink.value;
      program.permalinkElement = permalink.element;

      program.firstBroadcast = doc.date('Erstausstrahlung', { required: true });
      program.subtitle = doc.field('Untertitel');
      program.image = doc.field('Bild', validatePath);
      program.imageCaption = doc.string('Bilduntertitel');
      program.soundfile = doc.field('Soundfile', validatePath, { required: true });
      program.editorReferences = doc.list('Redaktion', { withElements: true });
      program.language = doc.field('Sprache');
      program.categoriesDisconnected = doc.list('Kategorien');
      program.tagsDisconnected = doc.list('Tags');
      program.abstract = doc.field('Abstract', validateMarkdown);
      program.text = doc.field('Text', validateMarkdownWithMedia);

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

    data.cache.set(enoPath, { program: program, stats: stats });
    data.programs.set(enoPath, program);
  }
};
