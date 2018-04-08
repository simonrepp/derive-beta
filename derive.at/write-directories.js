const fsExtra = require('fs-extra');

const { createDir } = require('../derive-common/util.js'),
      { letters } = require('./pages/authors.js');

module.exports = async data => {
  await fsExtra.emptyDir(data.buildDir);

  const topDirectories = [
    'api',
    'autoren',
    'bücher',
    'festival',
    'radio',
    'seite-nicht-gefunden',
    'seiten',
    'suche',
    'tags',
    'texte',
    'veranstaltungen',
    'verlage',
    'zeitschrift'
  ];

  await Promise.all(topDirectories.map(dir => createDir(data.buildDir, dir)));

  const midDirectories = new Set(['api/search']);

  data.articlesPaginated.forEach(pagination => midDirectories.add(`texte/${pagination.label}/`));
  data.authors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.bookAuthors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.books.forEach(book => midDirectories.add(`bücher/${book.permalink}`));
  data.booksPaginated.forEach(pagination => midDirectories.add(`bücher/${pagination.label}/`));
  data.events.forEach(event => midDirectories.add(`veranstaltungen/${event.permalink}`));
  data.issues.forEach(issue => midDirectories.add(`zeitschrift/${issue.number}`));
  data.pages.forEach(page => midDirectories.add(`seiten/${page.permalink}`));
  data.programs.forEach(program => midDirectories.add(`radio/${program.permalink}`));
  data.programsPaginated.forEach(pagination => midDirectories.add(`radio/${pagination.label}/`));
  data.publishers.forEach(publisher => midDirectories.add(`verlage/${publisher.permalink}`));
  data.tags.forEach(tag => midDirectories.add(`tags/${tag.permalink}`));
  data.visibleArticles.forEach(article => midDirectories.add(`texte/${article.permalink}`));

  letters.forEach(letter => midDirectories.add(`autoren/${letter}`));

  await Promise.all([...midDirectories].map(dir => createDir(data.buildDir, dir)));

  const deepDirectories = [];

  data.visibleArticles.forEach(article => deepDirectories.push(`texte/${article.permalink}/druckversion`));

  await Promise.all(deepDirectories.map(dir => createDir(data.buildDir, dir)));
};
