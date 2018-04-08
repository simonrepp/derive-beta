const ValidationError = require('./error.js');

module.exports = (document, field, choices, options = { required: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    if(options.required) {
      throw new ValidationError(`Das Auswahlfeld "${field}" muss ausgefüllt sein.`);
    } else {
      return null;
    }
  } else if(typeof value === 'string') {
    if(choices.includes(value)) {
      return value;
    } else {
      throw new ValidationError(`Das Feld "${field}" enthält den Wert "${value}", sollte aber einen der folgenden Werte enthalten: ${choices.map(choice => `"${choice}"`).join(', ')} (Gross/Kleinschreibung beachten!).`);
    }
  } else {
    throw new ValidationError(`Das Auswahlfeld "${field}" muss einen Textwert enthalten, enthält aber einen anderen Datentyp.`);
  }
};
