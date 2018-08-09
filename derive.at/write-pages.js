const { writeFile } = require('../derive-common/util.js');

const articlePage = require('./pages/article.js'),
      articlePrintPage = require('./pages/article-print.js'),
      articlesPage = require('./pages/articles.js'),
      authorPage = require('./pages/author.js'),
      authorsPage = require('./pages/authors.js'),
      bookPage = require('./pages/book.js'),
      booksPage = require('./pages/books.js'),
      festivalPage = require('./pages/festival.js'),
      imprintPage = require('./pages/imprint.js'),
      indexPage = require('./pages/index.js'),
      issuePage = require('./pages/issue.js'),
      issuesPage = require('./pages/issues.js'),
      notFoundPage = require('./pages/404.js'),
      publisherPage = require('./pages/publisher.js'),
      programPage = require('./pages/program.js'),
      programsPage = require('./pages/programs.js'),
      searchPage = require('./pages/search.js'),
      tagPage = require('./pages/tag.js');

module.exports = async data => {
  await Promise.all([
    writeFile(data.buildDir, 'texte/index.html', articlesPage(data, data.articlesPaginated[0])),
    writeFile(data.buildDir, 'autoren/index.html', authorsPage(data)),
    writeFile(data.buildDir, 'bücher/index.html', booksPage(data, data.booksPaginated[0])),
    writeFile(data.buildDir, 'festival/index.html', festivalPage(data)),
    writeFile(data.buildDir, 'imprint.html', imprintPage(data)),
    writeFile(data.buildDir, 'index.html', indexPage(data)),
    writeFile(data.buildDir, 'zeitschrift/index.html', issuesPage(data)),
    writeFile(data.buildDir, 'seite-nicht-gefunden/index.html', notFoundPage(data)),
    writeFile(data.buildDir, 'radio/index.html', programsPage(data, data.programsPaginated[0])),
    writeFile(data.buildDir, 'suche/index.html', searchPage(data))
  ]);

  for(let pagination of data.articlesPaginated) {
    await writeFile(data.buildDir, `texte/${pagination.label}/index.html`, articlesPage(data, pagination));
  }

  for(let article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/index.html`, articlePage(data, article));
  }

  for(let article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/druckversion/index.html`, articlePrintPage(data, article));
  }

  for(let author of data.authors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(data, author));
  }

  for(let pagination of data.authorsPaginated) {
    await writeFile(data.buildDir, `autoren/${pagination.label}/index.html`, authorsPage(data, pagination));
  }

  for(let pagination of data.booksPaginated) {
    await writeFile(data.buildDir, `bücher/${pagination.label}/index.html`, booksPage(data, pagination));
  }

  for(let author of data.bookAuthors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(data, author));
  }

  for(let issue of data.issues.values()) {
    await writeFile(data.buildDir, `zeitschrift/${issue.permalink}/index.html`, issuePage(data, issue));
  }

  for(let publisher of data.publishers) {
    await writeFile(data.buildDir, `verlage/${publisher.permalink}/index.html`, publisherPage(data, publisher));
  }

  for(let book of data.books.values()) {
    await writeFile(data.buildDir, `bücher/${book.permalink}/index.html`, bookPage(data, book));
  }

  for(let pagination of data.programsPaginated) {
    await writeFile(data.buildDir, `radio/${pagination.label}/index.html`, programsPage(data, pagination));
  }

  for(let program of data.programs.values()) {
    await writeFile(data.buildDir, `radio/${program.permalink}/index.html`, programPage(data, program));
  }

  for(let tag of data.tags.values()) {
    await writeFile(data.buildDir, `tags/${tag.permalink}/index.html`, tagPage(data, tag));
  }
};
