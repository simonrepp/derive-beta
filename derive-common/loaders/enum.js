const FEATURE_TYPES = [
  'landscape',
  'portrait',
  'card'
];

const URBANIZE_EDITIONS = [
  '2012',
  '2013',
  '2014',
  '2015',
  'Hamburg 2016',
  'Wien 2016',
  '2017',
  'Berlin 2018',
  'Wien 2018',
  '2019'
];

exports.featureType = value => {
  if(FEATURE_TYPES.includes(value)) {
    return value;
  } else {
    throw `Ein Feature Typ ist erforderlich ('landscape', 'portrait' oder 'card'), der aktuelle Wert ${value} ist nicht erlaubt. (Gross/Kleinschreibung beachten!).`;
  }
}

exports.urbanizeEdition = value => {
  if(URBANIZE_EDITIONS.includes(value)) {
    return value;
  } else {
    throw `Eine Urbanize Edition muss angegeben werden (${URBANIZE_EDITIONS.map(edition => `"${edition}"`).join(', ')}) der aktuelle Wert ${value} ist nicht erlaubt (Gross/Kleinschreibung beachten!).`;
  }
}

exports.URBANIZE_EDITIONS = URBANIZE_EDITIONS;
