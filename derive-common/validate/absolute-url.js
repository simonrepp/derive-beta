const ValidationError = require('./error.js');

const urlRegex = /^https?:\/\/.+\..+$/;

module.exports = (document, field, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das URL Feld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    const match = urlRegex.exec(value);

    if(match) {
      return value;
    } else {
      throw new ValidationError(`Das Feld "${field}" muss als eine vollständige absolute URL im Format "http(s)://beispiel.com" formatiert sein, vorgefunden wurde aber "${value}".`);
    }
  } else {
    throw new ValidationError(`Das Feld "${field}" muss eine URL enthalten, enthält aber einen anderen Datentyp.`);
  }
};
