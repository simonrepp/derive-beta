const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('../../enojs/eno.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.players.set(plainPath, cached.player);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, plainPath);
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof EnoParseError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const player = {
      draft: plainPath.match(/\.entwurf\.plain$/),
      sourceFile: plainPath
    };

    doc.enforcePresence(true);

    try {
      const name = doc.field('Name', { required: true, withTrace: true });
      player.name = name.value;
      player.nameTrace = name.trace;

      const permalink = doc.field('Permalink', validatePermalink, { required: true, withTrace: true });
      player.permalink = permalink.value;
      player.permalinkTrace = permalink.trace;

      player.country = doc.field('Land');
      player.city = doc.field('Stadt');
      player.tagsDisconnected = doc.list('Tags');
      player.website = doc.field('Website', validateAbsoluteUrl);
      player.biography = doc.field('Biographie', validateMarkdown);
      player.text = doc.field('Text', validateMarkdown);

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(plainPath);

      if(err instanceof EnoValidationError) {
        data.warnings.push({
          files: [{ path: plainPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(plainPath, { player: player, stats: stats });
    data.players.set(plainPath, player);
  }
};
