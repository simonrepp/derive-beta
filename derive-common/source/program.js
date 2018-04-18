const { loadPlain, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
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

    const program = { sourceFile: plainPath };

    try {
      program.title = document.value('Titel', { required: true });
      program.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      program.permalinkMeta = document.meta('Permalink');
      program.firstBroadcast = document.value('Erstausstrahlung', { process: validateDate, required: true });
      program.subtitle = document.value('Untertitel');
      program.image = document.value('Bild', { process: validatePath });
      program.soundfile = document.value('Soundfile', { process: validatePath });
      program.editors = { sourced: document.values('Redaktion') };
      program.language = document.value('Sprache');
      program.categories = { sourced: document.values('Kategorien') };
      program.tags = { sourced: document.values('Tags') };
      program.abstract = document.value('Abstract', { process: validateMarkdown });
      program.text = document.value('Text', { process: validateMarkdownWithMedia });

      document.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof PlainDataError) {
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
