const { loadPlain, statFile } = require('../util.js'),
      { PlainValidationError, PlainParseError } = require('../../plain/plain.js'),
      validateDate = require('../validate/date.js'),
      { validateMarkdown, validateMarkdownWithMedia } = require('../validate/markdown.js'),
      validatePath = require('../validate/path.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.programs.set(plainPath, cached.program);
  } else {
    let doc;

    try {
      doc = await loadPlain(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainParseError) {
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

    const program = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
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
      data.cache.delete(plainPath);

      if(err instanceof PlainValidationError) {
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

    data.cache.set(plainPath, { program: program, stats: stats });
    data.programs.set(plainPath, program);
  }
};
