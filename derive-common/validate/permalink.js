const slug = require('speakingurl');

module.exports = ({ name, value }) => {
  const slugified = slug(value);

  if(value === slugified) {
    return value;
  } else {
    throw `Das Permalink-Feld "${name}" enthält den Wert "${value}", dieser entspricht aber nicht den Anforderungen, eine erlaubte Variante wäre zum Beispiel: ${slugified}.`;
  }
};
