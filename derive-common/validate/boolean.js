module.exports = ({ key, value }) => {
  const lowercase = value.toLowerCase();

  if(lowercase === 'ja') {
    return true;
  }

  if(lowercase === 'nein') {
    return false;
  }

  throw `Das Feld "${key}" muss den Wert "Ja" oder "Nein" enthalten, enthält aber den Wert "${value}".`;
};
