const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.players.set(enoPath, cached.player);
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

    const player = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      player.nameField = doc.field('Name');
      player.name = player.nameField.requiredStringValue();
      player.permalinkField = doc.field('Permalink');
      player.permalink = player.permalinkField.requiredPermalinkValue();
      player.firstName = doc.field('Vorname').optionalStringValue();
      player.lastName = doc.field('Nachname').optionalStringValue();
      player.country = doc.field('Land').optionalStringValue();
      player.city = doc.field('Stadt').optionalStringValue();
      player.tagsDisconnected = doc.list('Tags').requiredStringValues();
      player.website = doc.field('Website').optionalUrlValue();
      player.biography = doc.field('Biographie').optionalMarkdownValue();
      player.text = doc.field('Text').optionalMarkdownValue();

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

    data.cache.set(enoPath, { player: player, stats: stats });
    data.players.set(enoPath, player);
  }
};
