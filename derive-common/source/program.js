const { loadPlain, statFile } = require('../util.js'),
      { PlainDataValidationError, PlainDataParseError } = require('../../plaindata/plaindata.js'),
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

    const program = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    try {
      program.title = document.attribute('Titel', { required: true });

      const permalink = document.attribute('Permalink', validatePermalink, { required: true, withTrace: true });
      program.permalink = permalink.value;
      program.permalinkTrace = permalink.trace;

      program.firstBroadcast = document.attribute('Erstausstrahlung', validateDate, { required: true });
      program.subtitle = document.attribute('Untertitel');
      program.image = document.attribute('Bild', validatePath);
      program.soundfile = document.attribute('Soundfile', validatePath);
      program.editorReferences = document.list('Redaktion', { withTrace: true });
      program.language = document.attribute('Sprache');
      program.categoriesDisconnected = document.list('Kategorien');
      program.tagsDisconnected = document.list('Tags');
      program.abstract = document.attribute('Abstract', validateMarkdown);
      program.text = document.attribute('Text', validateMarkdownWithMedia);

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

    data.cache.set(plainPath, { program: program, stats: stats });
    data.programs.set(plainPath, program);
  }
};
