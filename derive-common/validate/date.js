const dateRegex = /^([12]\d\d\d)-([01]\d)-([0123]\d)$/;

module.exports = ({ key, value }) => {
  const match = dateRegex.exec(value);

  if(match) {
    return new Date(match[1], parseInt(match[2]) - 1, match[3]);
  } else {
    throw `Das Feld "${key}" muss als Datum im Format "YYYY-MM-DD" formatiert sein, vorgefunden wurde aber "${value}".`;
  }
};
