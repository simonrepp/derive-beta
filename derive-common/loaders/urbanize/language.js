module.exports = value => {
  const lowercase = value.toLowerCase();

  if(lowercase === 'de' || lowercase === 'en')
    return lowercase;

  throw `Einer der beiden Sprachcodes - "de" oder "en" - ist erforderlich, "${value}" ist nicht vorgesehen.`;
};
