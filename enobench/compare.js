const adv = require('../enojs/eno.js');
const yaml = require('js-yaml');

const advSimple = `
fun: veal
times: with
with: times
veal: fun
`;

const yamlSimple = `
fun: veal
times: with
with: times
veal: fun
`;

const advComplex = `
# doc
colors:
- blue
- green
- orange
- red
traits:
tired = somewhat
extroverted = sometimes
funny = always
inventive = occasionally
things:
- boxes
- canes
- pyramids
- cubes
## deep
sea: blue
### deep
sea: darkblue
#### deep
sea: black
`;

const yamlComplex = `
doc:
  colors:
    - blue
    - green
    - orange
    - red
  traits:
    tired: somewhat
    extroverted: sometimes
    funny: always
    inventive: occasionally
  things:
    - boxes
    - canes
    - pyramids
    - cubes
  deep:
    sea: blue
    deep:
      sea: darkblue
      deep:
        sea: black
`;

const advJourney = `
title: Journey to the End of the Night Vienna 2009
date: 2009-08-07
time: 18:30
abstract: Prater Hauptallee - Metalab
# checkpoints
special: start
location:  Hauptallee A
coordinates: 48.205870, 16.413690
# checkpoints
location: Ilgplatz
hint: Scientists / Indian Burial Ground
coordinates: 48.219534, 16.405041
## safezone
shape: circle
center: 48.219513, 16.405041
radius: 20
# checkpoints
location: Krakauerstrasse 27
hint: Fortune Tellers / Playground something
coordinates: 48.226835, 16.396787
# checkpoints
location: Wallensteinplatz
hint: Puzzle / Riddle
coordinates: 48.229600, 16.371639
# checkpoints
location: Bindergasse 3
hint: Bathtub / Childhood memories
coordinates: 48.225857, 16.355580
# checkpoints
location: Servittenkirche Vorplatz
hint: Wohnzimmer setting
coordinates: 48.220560, 16.364078
# checkpoints
special: finish
location: Friedrich-Schmidt-Platz 1
coordinates: 48.211004, 16.356364
`;

const yamlJourney = `
title: Journey to the End of the Night Vienna 2009
date: 2009-08-07
time: '18:30'
abstract: Prater Hauptallee - Metalab
checkpoints:
  - special: start
    location:  Hauptallee A
    coordinates: 48.205870, 16.413690
  - location: Ilgplatz
    hint: Scientists / Indian Burial Ground
    coordinates: 48.219534, 16.405041
    safezone:
      shape: circle
      center: 48.219513, 16.405041
      radius: 20
  - location: Krakauerstrasse 27
    hint: Fortune Tellers / Playground something
    coordinates: 48.226835, 16.396787
  - location: Wallensteinplatz
    hint: Puzzle / Riddle
    coordinates: 48.229600, 16.371639
  - location: Bindergasse 3
    hint: Bathtub / Childhood memories
    coordinates: 48.225857, 16.355580
  - location: Servittenkirche Vorplatz
    hint: Wohnzimmer setting
    coordinates: 48.220560, 16.364078
  - special: finish
    location: Friedrich-Schmidt-Platz 1
    coordinates: 48.211004, 16.356364
`;

const advCopy = `
# production
## server-a
conf:
ruby=yes
python=no
clean: yes
steps:
- npm
- bundle
- audit
## server-b
conf:
ruby=yes
python=yes
clean: no
steps:
- npm
- bundle
- audit
# staging < production
`;

const yamlCopy = `
production: &default
  server-a:
    conf:
      ruby: yes
      python: no
    clean: yes
    steps:
      - npm
      - bundle
      - audit
  server-b:
    conf:
      ruby: yes
      python: yes
    clean: no
    steps:
      - npm
      - bundle
      - audit
staging:
  <<: *default
`;

// adv: 18248.276ms
// yaml: 13389.287ms
// const advSample = advSimple;
// const yamlSample = yamlSimple;
// const iterations = 3000000;

// adv: 216158.251ms
// yaml: 189045.920ms
// const advSample = advComplex;
// const yamlSample = yamlComplex;
// const iterations = 9999999;

// adv: 71168.779ms
// yaml: 83673.389ms
// const advSample = advJourney;
// const yamlSample = yamlJourney;
// const iterations = 2000000;

// adv: 93658.729ms
// yaml: 54908.901ms
// const advSample = advCopy;
// const yamlSample = yamlCopy;
// const iterations = 3000000;

console.time('adv');

for(let i = 0; i < iterations; i++) {
  adv.parse(advSample);
}

console.timeEnd('adv');

console.time('yaml');

for(let i = 0; i < iterations; i++) {
  yaml.load(yamlSample);
}

console.timeEnd('yaml');
