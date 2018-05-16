const manifest = {
  'Titel': eno.value.required.dictionary('title'),
  'Autoren': eno.list.dictionary('authors'),
  'Datum': eno.value.dictionary('date').process(date => moment(date).format('YYYY'))
};

const document = parse(enoString, manifest);

// ...

const { parse, EnoValidationError } = require('eno');

const doc = parse(enoString);

try {
  const title = doc.get('title', EnoValidationError);
  const authors = doc.get('authors', []);
  const document = doc.get('subsection', {});

  // alternate

  const title = doc.get('title', eno.value.required);
  const authors = doc.get('authors', eno.list.optional);

  authors = authors.dictionary(author => {
    return author.get(...)
  });

  const document = doc.get('subsection', eno.dict.required);

  const document = doc.get('subsection', eno.dict.required, (section) => {
    section.name = section.get('name', eno.value.required, name => name.toLowerCase);
    section.year = section.get('date', eno.value, date => moment(date).format('YYYY'));
    section.friends = section.get('friends', eno.array.required, friend => friend.get(eno.value));
  });

} catch(err) {
  // handle
  if(err instanceof EnoValidationError) {
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
