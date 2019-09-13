const { loadEno, statFile } = require('../../util.js');
const { EnoError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.urbanize.participants = cached.participants;
  } else {
    try {
      const doc = await loadEno(data.root, enoPath);

      doc.allElementsRequired();

      const participants = doc.sections().map(participantSection => ({
        firstName: participantSection.field('Vorname').optionalStringValue(),
        lastName: participantSection.field('Nachname').optionalStringValue(),
        links: participantSection.list('Links').requiredUrlValues(),
        name: participantSection.stringKey(),
        permalinkField: participantSection.field('Permalink'),
        permalink: participantSection.field('Permalink').requiredPermalinkValue(),
        sourceFile: enoPath,
        text: participantSection.field('Text').requiredStringValue()
      }));

      doc.assertAllTouched();

      data.cache.set(enoPath, { participants, stats });
      data.urbanize.participants = participants;
    } catch(err) {
      if(!(err instanceof EnoError))
        throw err;

      data.cache.delete(enoPath);
      data.errors.push({
        files: [{ path: enoPath, selection: err.selection }],
        message: err.text,
        snippet: err.snippet
      });
    }
  }
};
