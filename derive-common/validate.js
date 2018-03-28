const markdownIt = require('markdown-it')({ html: true });

exports.URBANIZE_ENUM = [
  '2012',
  '2013',
  '2014',
  '2015',
  '2016', // TODO: Hamburg/Wien urbanize ENUM and remove from categories
  '2017',
  'Berlin 2018',
  'Wien 2018'
];

exports.validateArray = (document, field) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(!Array.isArray(document[field])) {
    throw `Das Feld "${field}" muss eine Auflistung sein, enthält aber einen anderen Datentyp.`;
  }

  const array = document[field];
  delete document[field];

  return array;
};

exports.validateBoolean = (document, field) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(document[field] === 'Ja' || document[field] === 'ja') {
    delete document[field];
    return true;
  } else if(document[field] === 'Nein' || document[field] === 'nein') {
    delete document[field];
    return false;
  } else {
    throw `Das Feld "${field}" muss den Wert "Ja" oder "Nein" enthalten, enthält aber den Wert "${document[field]}".`;
  }
};

exports.validateDate = (document, field, required = false) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(typeof document[field] !== 'string') {
    throw `Das Feld "${field}" muss ein Datum sein, enthält aber einen anderen Datentyp.`;
  }

  if(required && !document[field].trim()) {
    throw `Das Datumsfeld "${field}" muss ausgefüllt sein.`;
  }

  if(document[field].trim() && !document[field].match(/[12]\d\d\d-[01]\d-[0123]\d/)) {
    throw `Das Feld "${field}" muss als Datum im Format "YYYY-MM-DD" formatiert sein, vorgefunden wurde aber "${document[field]}".`;
  }

  const date = document[field];
  delete document[field];

  return date;
};

exports.validateEnum = (document, field, choices, required = false) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(typeof document[field] !== 'string') {
    throw `Das Feld "${field}" muss einen Textwert enthalten, enthält aber einen anderen Datentyp.`;
  }

  if((required || document[field].trim()) && !choices.includes(document[field])) {
    throw `Das Feld "${field}" enthält den Wert "${document[field]}", sollte aber einen der folgenden Werte enthalten: ${choices.map(choice => `"${choice}"`).join(', ')} (Gross/Kleinschreibung beachten!).`;
  }

  const choice = document[field];
  delete document[field];

  return choice;
};

exports.validateInteger = (document, field, required = false) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if((required || document[field].trim())) {
    const integer = parseInt(document[field]);

    if(integer === NaN) {
      throw `Das Feld "${field}" muss eine Ganzzahl enthalten, enthält aber "${document[field]}".`;
    } else {
      delete document[field];
      return integer;
    }
  } else {
    delete document[field];
    return null;
  }
};

// TODO: Pluggable, modulare regex components to build the md/html rules - also think more in terms of inception matching (no src="" inside src="", no ![]() inside ![]() ..)
exports.validateMarkdown = (document, field, data) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(typeof document[field] !== 'string') {
    throw `Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`;
  }

  // TODO: Make this more official (maybe encapsulate in markdown field object as sibling to text)
  const __media = new Map();

  let m;

  const mdMediaRule = /!?\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;
  while ((m = mdMediaRule.exec(document[field])) !== null) {
    const filePath = m[1].replace(/^\//, '');

    // TODO: Normalize paths as in validatePath ? See TODO there
    if(data.media.has(filePath)) {
      const count = data.media.get(filePath);
      data.media.set(filePath, count + 1);
      __media.set(filePath, 'TODO point to something like embed[n].[ext]');
    } else {
      throw `Das Markdown-Feld "${field}" enthält einen Verweis auf das File "${filePath}", dieses wurde aber nicht gefunden.`;
    }
  }

  const htmlMediaRule = /(?:href|src)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
  while ((m = htmlMediaRule.exec(document[field])) !== null) {
    const filePath = m[1].replace(/^\//, '');

    // TODO: Normalize paths as in validatePath ? See TODO there
    if(data.media.has(filePath)) {
      const count = data.media.get(filePath);
      data.media.set(filePath, count + 1);
      __media.set(filePath, 'TODO point to something like embed[n].[ext]'); // this is used in postprocessing then
    } else {
      throw `Das Markdown-Feld "${field}" enthält einen Verweis auf das File "${filePath}", dieses wurde aber nicht gefunden.`;
    }
  }

  // TODO: Consider possibility of replacing other stuff that matches by coincidence (maybe replace during matching, or store indices or something)
  __media.forEach((replacedPath, originalPath) =>
    document[field].replace(originalPath, replacedPath)
  );

  // Match against src="..."
  // const srcMatches = document[field].match(/src=".*" /g);
  // if(srcMatches) srcMatches.forEach(match => console.log(match));

  // Match against ![...](...)       TODO vvvv ](https?: NEGATIVE LOOKAHEAD THINGY to get rid of those here
  // const mdMatches  = document[field].match(/!\[((?!!\[.*\]\(.*\)).)*\]\(((?!!\[.*\]\(.*\)).)*\)/g);
  // if(mdMatches) {
  //   mdMatches.forEach(match => {
  //     if(!match.match(/\]\(https?:/)) {
  //       match = match.replace(/.*\]\(\//, '');
  //       match = match.replace(/("[^"]*")?\)\s*$/, '');
  //       match = match.replace(/\){: .*$/, '');
  //       match = match.trim();
  //
  //       const filePath = match.replace(/^\//, '');
  //
  //       // TODO: Normalize paths as in validatePath ? See TODO there
  //       if(data.media.has(filePath)) {
  //         const count = data.media.get(filePath);
  //         data.media.set(filePath, count + 1);
  //       } else {
  //         throw `Das Markdown-Feld "${field}" enthält einen Verweis auf das File "${filePath}", dieses wurde aber nicht gefunden.`;
  //       }
  //     }
  //   });
  // }

  // TODO: Consider replacing markdown fields with an object like
  // {
  //   html: theRenderedMarkdown,
  //   stripped: theStrippedMarkdown,
  //   files: ['/Dateien/foo.jpg', '/Dateien/Buchcover/Fanta.mp3'] <<<<< Can use this in postprocessing to text replace that in the renderedHTML (because verbatim copied there too!!)
  // }

  // TODO: Custom markdown processing necessary ?? (footnotes?)
  const markdown = markdownIt.render(document[field]);
  delete document[field];

  // const matches = markdown.match(/src\s*=\s*['"](.*?)['"]/g);
  // if(matches) {
  //   matches.forEach(match => {
  //     match = match.replace(/^src\s*=\s*['"]/, '');
  //     match = match.replace(/['"]$/, '');
  //
  //     // Kick out external urls
  //     if(match.match(/^\s*\/\/|^\s*https?:\/\//)) { return; }
  //
  //     const filePath = match.replace(/^\//, '');
  //
  //     // TODO: Normalize paths as in validatePath ? See TODO there
  //     if(data.media.has(filePath)) {
  //       const count = data.media.get(filePath);
  //       data.media.set(filePath, count + 1);
  //     } else {
  //       throw `Das Markdown-Feld "${field}" enthält einen Verweis auf das File "${filePath}", dieses wurde aber nicht gefunden.`;
  //     }
  //   });
  // }

  return markdown;
};

exports.validatePath = (document, field, data) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(typeof document[field] !== 'string') {
    throw `Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`;
  }

  const filePath = document[field].replace(/^\//, '');
  delete document[field];

  // TODO: Normalize all paths to be either /Aktuere blablabla, or without initial / ... has implications elsewhere so consider that
  if(filePath.trim() && !data.media.has(filePath)) {
    throw `Das Dateifeld "${field}" ist nicht leer, unter dem angegebenen Pfad "${filePath}" wurde aber keine Datei gefunden.`;
  } else {
    const count = data.media.get(filePath);
    data.media.set(filePath, count + 1);
  }

  return filePath;
};

exports.validateString = (document, field, required = false) => {
  if(!document.hasOwnProperty(field)) {
    throw `Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`;
  }

  if(typeof document[field] !== 'string') {
    throw `Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`;
  }

  if(required && !document[field].trim()) {
    throw `Das Feld "${field}" darf nicht leer sein.`;
  }

  const string = document[field];
  delete document[field];

  return string;
};

exports.validateEmpty = document => {
  if(Object.keys(document).length > 0) {
    throw `Nicht spezifiertes Feld "${Object.keys(document)}" gefunden - War eventuell ein anderes Feld gemeint und es handelt sich um einen Tippfehler?`;
  }
};
