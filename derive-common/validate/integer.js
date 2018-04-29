module.exports = ({ name, value }) => {
  const parsed = parseInt(value);

  if(isNaN(parsed)) {
    throw `Das Feld "${name}" muss eine Ganzzahl enthalten, enthält aber "${value}".`;
  } else {
    return parsed;
  }
};
