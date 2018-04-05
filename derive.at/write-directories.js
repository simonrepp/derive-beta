const fsExtra = require('fs-extra');

// TODO: replace fs-extra with fs where possible!

const { createDir } = require('../derive-common/util.js'),
      { letters } = require('./pages/authors.js');

module.exports = async data => {
  await fsExtra.emptyDir(data.buildDir);

  const topDirectories = [
    'api',
    'autoren',
    'bücher',
    'festival',
    'kiosk',
    'radio',
    'seite-nicht-gefunden',
    'suche',
    'tags',
    'texte',
    'veranstaltungen',
    'verlage',
    'zeitschrift'
  ];

  await Promise.all(topDirectories.map(dir => createDir(data.buildDir, dir)));

  const midDirectories = new Set(['api/search']);

  data.articles.forEach(article => midDirectories.add(`texte/${article.permalink}`));
  data.authors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.bookAuthors.forEach(author => midDirectories.add(`autoren/${author.permalink}`));
  data.books.forEach(book => midDirectories.add(`bücher/${book.permalink}`));
  data.events.forEach(event => midDirectories.add(`veranstaltungen/${event.permalink}`));
  data.issues.forEach(issue => midDirectories.add(`zeitschrift/${issue.number}`));
  data.programs.forEach(program => midDirectories.add(`radio/${program.permalink}`));
  data.publishers.forEach(publisher => midDirectories.add(`verlage/${publisher.permalink}`));
  data.tags.forEach(tag => midDirectories.add(`tags/${tag.permalink}`));
  letters.forEach(letter => midDirectories.add(`autoren/${letter}`));

  data.booksPaginated.forEach(pagination => midDirectories.add(`bücher/${pagination.label}/`));

  await Promise.all([...midDirectories].map(dir => createDir(data.buildDir, dir)));

  const deepDirectories = [];

  data.articles.forEach(article => deepDirectories.push(`texte/${article.permalink}/druckversion`));

  await Promise.all(deepDirectories.map(dir => createDir(data.buildDir, dir)));
};
