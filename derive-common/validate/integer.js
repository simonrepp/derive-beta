const ValidationError = require('./error.js');

module.exports = (document, field, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das Ganzzahlfeld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    const integer = parseInt(value);

    if(isNaN(integer)) {
      throw new ValidationError(`Das Feld "${field}" muss eine Ganzzahl enthalten, enthält aber "${document[field]}".`);
    } else {
      return integer;
    }
  } else {
    throw new ValidationError(`Das Feld "${field}" muss eine Ganzzahl enthalten, enthält aber einen anderen Datentyp.`);
  }
};
