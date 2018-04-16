module.exports = ({ key, value }) => {
  const parsed = parseInt(value);

  if(isNaN(parsed)) {
    throw `Das Feld "${key}" muss eine Ganzzahl enthalten, enthält aber "${value}".`;
  } else {
    return parsed;
  }
};
