const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateDate = require('../validate/date.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

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

    const program = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
    };

    doc.enforcePresence(true);

    try {
      program.title = doc.field('Titel', { required: true });

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      program.permalink = permalink.value;
      program.permalinkTrace = permalink.trace;

      program.firstBroadcast = doc.field('Erstausstrahlung', validateDate, { required: true });
      program.subtitle = doc.field('Untertitel');
      program.image = doc.field('Bild', validatePath);
      program.soundfile = doc.field('Soundfile', validatePath);
      program.editorReferences = doc.list('Redaktion', { withTrace: true });
      program.language = doc.field('Sprache');
      program.categoriesDisconnected = doc.list('Kategorien');
      program.tagsDisconnected = doc.list('Tags');
      program.abstract = doc.field('Abstract', validateMarkdown);
      program.text = doc.field('Text', validateMarkdownWithMedia);

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

    data.cache.set(enoPath, { program: program, stats: stats });
    data.programs.set(enoPath, program);
  }
};
