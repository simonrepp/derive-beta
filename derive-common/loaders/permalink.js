const slug = require('speakingurl');

module.exports = value => {
  const slugified = slug(value);

  if(value === slugified) {
    return value;
  } else {
    throw `Ein Permalink ist erforderlich, der momentane Wert "${value}" entspricht aber nicht den Anforderungen, eine erlaubte Variante wäre zum Beispiel: ${slugified}.`;
  }
};
