const fsExtra = require('fs-extra');

const { createDir } = require('../derive-common/util.js');

module.exports = async data => {
  await fsExtra.emptyDir(data.buildDir);

  const topDirectories = [
    'api',
    'autoren',
    'buecher',
    'features',
    'festival',
    'kino',
    'newsletter',
    'radio',
    'seite-nicht-gefunden',
    'suche',
    'tags',
    'texte',
    'verlage',
    'zeitschrift'
  ];

  data.pages.forEach(page => topDirectories.push(page.permalink));

  await Promise.all(topDirectories.map(dir => createDir(data.buildDir, dir)));

  const midDirectories = new Set([
    'api/search'
  ]);

  data.articles.forEach(article => midDirectories.add(`texte/${article.permalink}`));
  data.articlesPaginated.forEach(pagination => midDirectories.add(`texte/${pagination.label}`));
  data.authors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.authorsPaginated.forEach(pagination => midDirectories.add(`autoren/${pagination.label}`));
  data.bookAuthors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.books.forEach(book => midDirectories.add(`buecher/${book.permalink}`));
  data.booksPaginated.forEach(pagination => midDirectories.add(`buecher/${pagination.label}`));
  data.issues.forEach(issue => midDirectories.add(`zeitschrift/${issue.permalink}`));
  data.programs.forEach(program => midDirectories.add(`radio/${program.permalink}`));
  data.programsPaginated.forEach(pagination => midDirectories.add(`radio/${pagination.label}`));
  data.publishers.forEach(publisher => midDirectories.add(`verlage/${publisher.permalink}`));
  data.screenings.forEach(screening => midDirectories.add(`kino/${screening.permalink}`));
  data.tags.forEach(tag => midDirectories.add(`tags/${tag.permalink}`));

  await Promise.all([...midDirectories].map(dir => createDir(data.buildDir, dir)));

  const deepDirectories = [];

  data.articles.forEach(article => deepDirectories.push(`texte/${article.permalink}/druckversion`));

  await Promise.all(deepDirectories.map(dir => createDir(data.buildDir, dir)));
};
