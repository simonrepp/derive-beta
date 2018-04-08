const ValidationError = require('./error.js');

module.exports = (document, field, options = { optional: false }) => {
  if(!document.hasOwnProperty(field)) {
    if(options.optional) {
      return [];
    } else {
      throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
    }
  }

  const value = document[field];

  if(value === null) {
    return [];
  } else if(Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
};
