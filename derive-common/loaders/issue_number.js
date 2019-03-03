const ISSUE_REGEXP = /^\d+(?:\/\d+)?$/;

module.exports = value => {
  if(!value.match(ISSUE_REGEXP))
    throw `Eine Ganzzahl ist erforderlich, bzw. bei Doppelausgaben zwei durch '/' getrennte Ganzzahlen, zum Beispiel '13' oder '40/41'`;

  return value;
};
