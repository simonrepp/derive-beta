const dateRegex = /^([12]\d\d\d)-([01]\d)-([0123]\d)$/;

module.exports = ({ name, value }) => {
  const match = dateRegex.exec(value);

  if(match) {
    return new Date(match[1], parseInt(match[2]) - 1, match[3]);
  } else {
    throw `Das Feld "${name}" muss als Datum im Format "YYYY-MM-DD" formatiert sein, vorgefunden wurde aber "${value}".`;
  }
};
