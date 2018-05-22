const { loadEno, statFile } = require('../util.js'),
      { EnoValidationError, EnoParseError } = require('enojs'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.players.set(enoPath, cached.player);
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

    const player = {
      draft: enoPath.match(/\.entwurf\.eno$/),
      sourceFile: enoPath
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

    data.cache.set(enoPath, { player: player, stats: stats });
    data.players.set(enoPath, player);
  }
};
