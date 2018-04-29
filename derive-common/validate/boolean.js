module.exports = ({ name, value }) => {
  const lowercase = value.toLowerCase();

  if(lowercase === 'ja') {
    return true;
  }

  if(lowercase === 'nein') {
    return false;
  }

  throw `Das Feld "${name}" muss den Wert "Ja" oder "Nein" enthalten, enthält aber den Wert "${value}".`;
};
