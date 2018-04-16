module.exports = choices => {
  return ({ key, value }) => {
    if(choices.includes(value)) {
      return value;
    } else {
      throw `Das Feld "${key}" enthält den Wert "${value}", sollte aber einen der folgenden Werte enthalten: ${choices.map(choice => `"${choice}"`).join(', ')} (Gross/Kleinschreibung beachten!).`;
    }
  };
};
