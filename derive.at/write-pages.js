const fsExtra = require('fs-extra'),
      path = require('path');

const { writeFile } = require('../derive-common/util.js');

const articlePage = require('./pages/article.js'),
      articlePrintPage = require('./pages/article-print.js'),
      articlesPage = require('./pages/articles.js'),
      authorPage = require('./pages/author.js'),
      { authorsPage, letters } = require('./pages/authors.js'),
      bookPage = require('./pages/book.js'),
      booksPage = require('./pages/books.js'),
      festivalPage = require('./pages/festival.js'),
      imprintPage = require('./pages/imprint.js'),
      indexPage = require('./pages/index.js'),
      kioskPage = require('./pages/kiosk.js'),
      issuesPage = require('./pages/issues.js'),
      notFoundPage = require('./pages/404.js'),
      publisherPage = require('./pages/publisher.js'),
      programPage = require('./pages/program.js'),
      programsPage = require('./pages/programs.js'),
      searchPage = require('./pages/search.js'),
      tagPage = require('./pages/tag.js');

module.exports = async data => {
  const write = (html, filePath) => fsExtra.outputFile(path.join(data.buildDir, filePath), html);

  await Promise.all([
    writeFile(data.buildDir, 'texte/index.html', articlesPage(data)),
    writeFile(data.buildDir, 'autoren/index.html', authorsPage(data)),
    writeFile(data.buildDir, 'bücher/index.html', booksPage(data, data.booksPaginated[0])),
    writeFile(data.buildDir, 'festival/index.html', festivalPage()),
    writeFile(data.buildDir, 'imprint.html', imprintPage()),
    writeFile(data.buildDir, 'index.html', indexPage()),
    writeFile(data.buildDir, 'kiosk/index.html', kioskPage()),
    writeFile(data.buildDir, 'zeitschrift/index.html', issuesPage(data)),
    writeFile(data.buildDir, 'seite-nicht-gefunden/index.html', notFoundPage()),
    writeFile(data.buildDir, 'radio/index.html', programsPage(data)),
    writeFile(data.buildDir, 'suche/index.html', searchPage())
  ]);

  for(let article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/index.html`, articlePage(article));
  }

  for(let article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/druckversion/index.html`, articlePrintPage(article));
  }

  for(let letter of letters) {
    await writeFile(data.buildDir, `autoren/${letter}/index.html`, authorsPage(data, letter));
  }

  for(let author of data.authors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(author));
  }

  for(let pagination of data.booksPaginated) {
    await writeFile(data.buildDir, `bücher/${pagination.label}/index.html`, booksPage(data, pagination));
  }

  for(let author of data.bookAuthors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(author));
  }

  for(let publisher of data.publishers) {
    await writeFile(data.buildDir, `verlage/${publisher.permalink}/index.html`, publisherPage(publisher));
  }

  for(let book of data.books.values()) {
    await writeFile(data.buildDir, `bücher/${book.permalink}/index.html`, bookPage(book));
  }

  for(let program of data.programs.values()) {
    await writeFile(data.buildDir, `radio/${program.permalink}/index.html`, programPage(program));
  }

  for(let tag of data.tags.values()) {
    await writeFile(data.buildDir, `tags/${tag.permalink}/index.html`, tagPage(tag));
  }
};
