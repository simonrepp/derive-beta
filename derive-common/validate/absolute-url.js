const urlRegex = /^https?:\/\/.+\..+$/;

module.exports = ({ name, value }) => {
  if(value.match(urlRegex)) {
    return value;
  } else {
    throw `Das Feld "${name}" muss als eine vollständige absolute URL im Format "http(s)://beispiel.com" formatiert sein, vorgefunden wurde aber "${value}".`;
  }
};
