const { parseRaw } = require('plain');

const obj = parseRaw(plainDataString);

// ....

const manifest = {
  'Titel': pd.value.required.dictionary('title'),
  'Autoren': pd.list.dictionary('authors'),
  'Datum': pd.value.dictionary('date').process(date => moment(date).format('YYYY'))
};

const document = parse(plainDataString, manifest);

// ...

const { parse, AdventureValidationError } = require('plain');

const pd = parse(plainDataString);

try {
  const title = pd.get('title', AdventureValidationError);
  const authors = pd.get('authors', []);
  const document = pd.get('subsection', {});

  // alternate

  const title = pd.get('title', pd.value.required);
  const authors = pd.get('authors', pd.list.optional);

  authors = authors.dictionary(author => {
    return author.get(...)
  });

  const document = pd.get('subsection', pd.dict.required);

  const document = pd.get('subsection', pd.dict.required, (section) => {
    section.name = section.get('name', pd.value.required, name => name.toLowerCase);
    section.year = section.get('date', pd.value, date => moment(date).format('YYYY'));
    section.friends = section.get('friends', pd.array.required, friend => friend.get(pd.value));
  });

} catch(err) {
  // handle
  if(err instanceof AdventureValidationError) {
    ...
  }
}

//

autor: foo
 ... oder
(autor:
 - foo)
document.field('autor')
 => foo

autor: foo
autor: foo
(autor:
 - bar
 - baz)
document.list('autor')
 => [ foo, foo, bar, baz ]

autoren:
- foo
- foo
(autoren: bar
 autoren: baz)
document.list('autoren')
 => [ foo, foo, bar, baz ]

autoren:
- dan
autoren:
- jesper
- jed
(autoren: bud)
document.lists('autoren')
 => [ [ dan ], [ jesper, jed ], [ bud ] ]

autor:
sleepy = eyes
document.dictionary('autor')
 => { sleepy: eyes }

autor:
sleepy = eyes
autor:
sleepy = ears
document.dictionaries('autor')
 => [ { sleepy: eyes }, { sleepy: ears } ]

# autor
document.section('autor')
 => {}

# autor
# autor
document.sections('autor')
 => [ {}, {} ]

autor: bill
autor:
- x
- y
autor:
sleepy = eyed
#autor
document.mixed('autor')
// document.mixed('autor', { sections: true, dictionaries: true, attributes: true, lists: true })
 => [ bill, [ x, y ], { sleepy: eyed }, {} ]
