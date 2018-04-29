module.exports = choices => {
  return ({ name, value }) => {
    if(choices.includes(value)) {
      return value;
    } else {
      throw `Das Feld "${name}" enthält den Wert "${value}", sollte aber einen der folgenden Werte enthalten: ${choices.map(choice => `"${choice}"`).join(', ')} (Gross/Kleinschreibung beachten!).`;
    }
  };
};
