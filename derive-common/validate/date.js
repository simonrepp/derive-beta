const ValidationError = require('./error.js');

const dateRegex = /^([12]\d\d\d)-([01]\d)-([0123]\d)$/;

module.exports = (document, field, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das Datumsfeld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    const match = dateRegex.exec(value);

    if(match) {
      return new Date(match[1], parseInt(match[2]) - 1, match[3]);
    } else {
      throw new ValidationError(`Das Feld "${field}" muss als Datum im Format "YYYY-MM-DD" formatiert sein, vorgefunden wurde aber "${value}".`);
    }
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Datum sein, enthält aber einen anderen Datentyp.`);
  }
};
