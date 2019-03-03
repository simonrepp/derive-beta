const PAGES_REGEXP = /^\d{2,3}(?:-\d{2,3})?(?:, \d{2,3}(?:-\d{2,3})?)?$|^Nur online$/;

module.exports = value => {
  if(!value.match(PAGES_REGEXP))
    throw `Erlaubte Formate für Seitenangaben sind: "01" / "13-14" / "23-42, 57-89" / "Nur online" `;

  return value;
};
