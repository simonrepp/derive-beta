const FEATURE_TYPES = [
  'landscape',
  'portrait',
  'card'
];

module.exports = value => {
  if(!FEATURE_TYPES.includes(value))
    throw `Ein Feature Typ ist erforderlich ('landscape', 'portrait' oder 'card'), der aktuelle Wert ${value} ist nicht erlaubt. (Gross/Kleinschreibung beachten!).`;

  return value;
};
