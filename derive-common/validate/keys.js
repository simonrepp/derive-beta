const ValidationError = require('./error.js');

module.exports = (document, specifiedKeys) => {
  const pendingKeys = new Set(specifiedKeys);

  Object.keys(document).forEach(key => {
    if(!pendingKeys.delete(key)) {
      throw new ValidationError(`Nicht spezifiertes Feld "${key}" gefunden - War eventuell ein anderes Feld gemeint und es handelt sich um einen Tippfehler? Die erlaubten Felder sind: ${specifiedKeys.map(key => `"${key}"`).join(', ')}.`);
    }
  });

  if(pendingKeys.size > 0) {
    throw new ValidationError(`Nicht alle erforderlichen Felder wurden gefunden. Fehlende Felder: ${[...pendingKeys].map(key => `"${key}"`).join(', ')}.`);
  }
};
