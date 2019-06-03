const CATEGORIES = [
  'Film-Kunst-Musik',
  'Stadt-Praxis',
  'Vortrag/Diskussion',
  'Workshop'
];

module.exports = value => {
  if(!CATEGORIES.includes(value))
    throw `Eine Urbanize Veranstaltungeskategorie ist erforderlich (eine von ${CATEGORIES.map(category => `'${category}'`).join(', ')}), '${value}' ist nicht erlaubt (auch Gross/Kleinschreibung beachten).`;

  return value;
};
