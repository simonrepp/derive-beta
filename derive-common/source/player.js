const { loadPlain, statFile } = require('../util.js'),
      { PlainDataError, PlainDataParseError } = require('../../plaindata/errors.js'),
      validateAbsoluteUrl = require('../validate/absolute-url.js'),
      { validateMarkdown } = require('../validate/markdown.js'),
      validatePermalink = require('../validate/permalink.js');

module.exports = async (data, plainPath) => {
  const cached = data.cache.get(plainPath);
  const stats = await statFile(data.root, plainPath);

  if(cached && stats.size === cached.stats.size && stats.mTimeMs === cached.stats.mTimeMs) {
    data.players.set(plainPath, cached.player);
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

    const player = { sourceFile: plainPath };

    try {
      player.name = document.value('Name', { required: true });
      player.nameMeta = document.meta('Name');
      player.permalink = document.value('Permalink', { process: validatePermalink, required: true });
      player.permalinkMeta = document.meta('Permalink');
      player.country = document.value('Land');
      player.city = document.value('Stadt');
      player.tags = { sourced: document.values('Tags') };
      player.website = document.value('Website', { process: validateAbsoluteUrl });
      player.biography = document.value('Biographie', { process: validateMarkdown });
      player.text = document.value('Text', { process: validateMarkdown });

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

    data.cache.set(plainPath, { player: player, stats: stats });
    data.players.set(plainPath, player);
  }
};
