const { parseRaw } = require('plaindata');

const obj = parseRaw(plainDataString);

// ....

const manifest = {
  'Titel': pd.value.required.map('title'),
  'Autoren': pd.list.map('authors'),
  'Datum': pd.value.map('date').process(date => moment(date).format('YYYY'))  
};

const document = parse(plainDataString, manifest);

// ...

const { parse, PlainDataError } = require('plaindata');

const pd = parse(plainDataString);

try {
  const title = pd.get('title', PlainDataError);
  const authors = pd.get('authors', []);
  const document = pd.get('subsection', {});

  // alternate

  const title = pd.get('title', pd.value.required);
  const authors = pd.get('authors', pd.list.optional);

  authors = authors.map(author => {
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
  if(err instanceof PlainDataError) {
    console.log(
      err.message
      err.
  }
}
