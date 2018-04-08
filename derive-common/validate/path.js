const ValidationError = require('./error.js');

module.exports = (document, field, data, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das Dateifeld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    const normalizedPath = value.replace(/^\//, '').normalize();

    return { sourced: normalizedPath };
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Dateifeld sein, enthält aber einen anderen Datentyp.`);
  }
};
