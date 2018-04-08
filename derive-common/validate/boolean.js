const ValidationError = require('./error.js');

module.exports = (document, field) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  const value = document[field];

  if(value === null) {
    throw new ValidationError(`Das Feld "${field}" ist leer, muss aber den Wert "Ja" oder "Nein" enthalten.`);
  } else if(value === 'Ja' || value === 'ja') {
    return true;
  } else if(value === 'Nein' || value === 'nein') {
    return false;
  } else {
    throw new ValidationError(`Das Feld "${field}" muss den Wert "Ja" oder "Nein" enthalten, enthält aber den Wert "${value}".`);
  }
};
