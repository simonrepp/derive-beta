const example = {
  number: 1,
  subsection: {
    subsubsection: {
      subsubsubsection: {
        oh: 'my'
      },
      key: 'value',
      list: [
        1,
        2,
        3
      ]
    }
  },
  key: 'value',
  '> key': 'value',
  '- key': 'value',
  '-- key': 'value',
  '--- key': 'value',
  '# key': 'value',
  '## key': 'value',
  '### key': 'value',
  'k: ey': 'value',
  date: new Date(),
  list: [
    'apple',
    'banana',
    'orange'
  ],
  object: {
    key: 'value',
    number: 3.41,
  },
  text: 'we were testing things.\nthings looked good.\nmostly.\n\n-- unknown',
  nasty: 'look\nat\nthis\n--- nasty\n---- nasty\n----- nasty\nthing'
};

const dump = (object, depth = 1) => {
  let sequential = [];
  let trailing = [];

  for(let key of Object.keys(object)) {
    const value = object[key];

    if(value === null) {
      sequential.push(`${key}:\n`);
    } else if(typeof value === 'string') {
      if(value.match(/\n/)) {
        let dashes = 3;
        while(value.includes(`\n${'-'.repeat(dashes)} ${key}`)) { dashes++; }
        sequential.push(`${'-'.repeat(dashes)} ${key}\n${value}\n${'-'.repeat(dashes)} ${key}\n`);
      } else if(key.match(/^\s*[>\-#]|: /)) {
        sequential.push(`-- ${key}\n-- ${value}\n`);
      } else {
        sequential.push(`${key}: ${value}\n`);
      }
    } else if(typeof value === 'number') {
      sequential.push(`${key}: ${value}\n`);
    } else if(Array.isArray(value)) {
      sequential.push(`${key}:\n${value.map(item => `- ${item}\n`).join('')}`);
    } else if(typeof value === 'object') {
      if(value instanceof Date) {
        sequential.push(`${key}: ${value.toISOString()}\n`);
      } else {
        trailing.push(`${'#'.repeat(depth)} ${key}\n\n${dump(value, depth + 1)}`);
      }
    }
  }

  return [].concat(sequential, trailing).join('\n');
};


const dumped = dump(example);

console.log(dumped);
