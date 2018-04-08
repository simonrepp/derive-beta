const { renderMarkdown } = require('./util.js'),
      slug = require('speakingurl');

class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, ValidationError);
  }
}

exports.ValidationError = ValidationError;

const dateRegex = /^([12]\d\d\d)-([01]\d)-([0123]\d)$/;

exports.URBANIZE_ENUM = [
  '2012',
  '2013',
  '2014',
  '2015',
  'Hamburg 2016',
  'Wien 2016',
  '2017',
  'Berlin 2018',
  'Wien 2018'
];

exports.validateArray = (document, field, options = { optional: false }) => {
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

exports.validateBoolean = (document, field) => {
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

exports.validateDate = (document, field, options = { required: false }) => {
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

exports.validateEnum = (document, field, choices, options = { required: false }) => {
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

exports.validateInteger = (document, field, options = { required: false }) => {
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

exports.validateKeys = (document, specifiedKeys) => {
  const pendingKeys = new Set(specifiedKeys);

  Object.keys(document).forEach(key => {
    if(!pendingKeys.delete(key)) {
      throw new ValidationError(`Nicht spezifiertes Feld "${key}" gefunden - War eventuell ein anderes Feld gemeint und es handelt sich um einen Tippfehler? Die erlaubten Felder sind: ${specifiedKeys.map(key => `"${key}"`).join(', ')}.`);
    }
  });

  if(pendingKeys.size > 0) {
    throw new ValidationError(`Nicht alle erforderlichen Felder wurden gefunden. Fehlende Felder: ${[...pendingKeys].map(key => `"${key}"`).join(', ')}.`);
  }
};

exports.validateMarkdown = (document, field, options = { process: true }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  let markdown = document[field];

  if(markdown === null) {
    return null;
  } else if(typeof markdown === 'string') {
    if(options.process) {
      try {
        return renderMarkdown(markdown);
      } catch(err) {
        throw new ValidationError(`Das Markdown im Feld "${field}" hat beim konvertieren einen Fehler ausgelöst: ${err}`);
      }
    }

    return { sourced: markdown };
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`);
  }
};

exports.validatePath = (document, field, data, options = { required: false }) => {
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
    return { sourced: value };
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Dateifeld sein, enthält aber einen anderen Datentyp.`);
  }
};

exports.validatePermalink = (document, field, options = { required: false }) => {
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

exports.validateString = (document, field, options = { required: false }) => {
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
    return value;
  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`);
  }
};
