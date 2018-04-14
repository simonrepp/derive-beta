const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

module.exports = () => {
  let samples = '';

  samples += 'https://wichtig.com: Oh the Value: Good!     \n';
  samples += '   A: Eine Telefonperformance der "Street Game Conspiracy" gemeinsam mit "Play:Vienna"    \n';
  samples += ' B: Besprechung von »Pierre Bourdieu: In Algerien. Zeugnisse der Entwurzelung« von Franz Schultheis und Christine Frisinghelli     \n';
  samples += '    C:    Besprechung von »Zusammen wohnen« von Micha Fedrowitz und Ludger Gailing und »An Architektur, Nr. 10. Gemeinschaftsräume«     \n';
  samples += 'Titel: ... And the  Street Goes on\n';

  const result = parse(samples);

  assert.strictEqual(result['https://wichtig.com'], 'Oh the Value: Good!');
  assert.strictEqual(result['A'], 'Eine Telefonperformance der "Street Game Conspiracy" gemeinsam mit "Play:Vienna"');
  assert.strictEqual(result['B'], 'Besprechung von »Pierre Bourdieu: In Algerien. Zeugnisse der Entwurzelung« von Franz Schultheis und Christine Frisinghelli');
  assert.strictEqual(result['C'], 'Besprechung von »Zusammen wohnen« von Micha Fedrowitz und Ludger Gailing und »An Architektur, Nr. 10. Gemeinschaftsräume«');
  assert.strictEqual(result['Titel'], '... And the  Street Goes on');

  Object.keys(result).forEach(key => {
    assert.strictEqual(result[key], result[key].trim());
  });
};
