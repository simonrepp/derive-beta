const { renderMarkdown } = require('../util.js'),
      ValidationError = require('./error.js');

module.exports = (document, field, options = { process: true }) => {
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
