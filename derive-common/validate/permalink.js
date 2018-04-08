const slug = require('speakingurl');

const ValidationError = require('./error.js');

module.exports = (document, field, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das Textfeld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    const slugified = slug(value);

    if(value === slugified) {
      return value;
    } else {
      throw new ValidationError(`Das Permalink-Feld "${field}" enthält den Wert "${value}", dieser entspricht aber nicht den Anforderungen, eine erlaubte Variante wäre zum Beispiel: ${slugified}.`);
    }
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`);
  }
};
