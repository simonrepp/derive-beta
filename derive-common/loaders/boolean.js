module.exports = value => {
  const lowercase = value.toLowerCase();

  if(lowercase === 'ja')
    return true;

  if(lowercase === 'nein')
    return false;

  throw `Der Wert "Ja" oder "Nein" ist erforderlich, der momentane Wert ist aber "${value}".`;
};
