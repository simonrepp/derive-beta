const slug = require('speakingurl');

module.exports = ({ key, value }) => {
  const slugified = slug(value);

  if(value === slugified) {
    return value;
  } else {
    throw `Das Permalink-Feld "${key}" enthält den Wert "${value}", dieser entspricht aber nicht den Anforderungen, eine erlaubte Variante wäre zum Beispiel: ${slugified}.`;
  }
};
