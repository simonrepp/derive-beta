const fsExtra = require('fs-extra'),
      path = require('path');

const articlePage = require('./src/pages/article.js'),
      articlePrintPage = require('./src/pages/article-print.js'),
      articlesPage = require('./src/pages/articles.js'),
      authorPage = require('./src/pages/author.js'),
      { authorsPage, letters } = require('./src/pages/authors.js'),
      bookPage = require('./src/pages/book.js'),
      booksPage = require('./src/pages/books.js'),
      festivalPage = require('./src/pages/festival.js'),
      imprintPage = require('./src/pages/imprint.js'),
      indexPage = require('./src/pages/index.js'),
      kioskPage = require('./src/pages/kiosk.js'),
      issuesPage = require('./src/pages/issues.js'),
      notFoundPage = require('./src/pages/404.js'),
      publisherPage = require('./src/pages/publisher.js'),
      programPage = require('./src/pages/program.js'),
      programsPage = require('./src/pages/programs.js'),
      searchPage = require('./src/pages/search.js'),
      tagPage = require('./src/pages/tag.js');

module.exports = async data => {
  const write = (html, filePath) => {
    return fsExtra.outputFile(path.join(data.buildDir, filePath), html);
  };

  await Promise.all([
    write(articlesPage(data), 'texte/index.html'),
    write(authorsPage(data), 'autoren/index.html'),
    write(booksPage(data), 'bücher/index.html'),
    write(festivalPage(), 'festival/index.html'),
    write(imprintPage(), 'imprint.html'),
    write(indexPage(), 'index.html'),
    write(kioskPage(), 'kiosk/index.html'),
    write(issuesPage(data), 'zeitschrift/index.html'),
    write(notFoundPage(), 'seite-nicht-gefunden/index.html'),
    write(programsPage(data), 'radio/index.html'),
    write(searchPage(), 'suche/index.html')
  ]);

  // TODO: possibly introduce the stableMode switch from config, maybe make it a factor too ?

  for(let article of data.articles.values()) {
    await write(articlePage(article), `texte/${article.permalink}/index.html`);
  }

  for(let article of data.articles.values()) {
    await write(articlePrintPage(article), `texte/${article.permalink}/druckversion/index.html`);
  }

  for(let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    await write(authorsPage(data, letter), `autoren/${letter}/index.html`);
  }

  for(let i = 0; i < data.authors.length; i++) {
    const author = data.authors[i];
    await write(authorPage(author), `autoren/${author.permalink}/index.html`);
  }

  for(let i = 0; i < data.bookAuthors.length; i++) {
    const author = data.bookAuthors[i];
    await write(authorPage(author), `autoren/${author.permalink}/index.html`);
  }

  for(let i = 0; i < data.publishers.length; i++) {
    const publisher = data.publishers[i];
    await write(publisherPage(publisher), `verlage/${publisher.permalink}/index.html`);
  }

  for(let book of data.books.values()) {
    await write(bookPage(book), `bücher/${book.permalink}/index.html`);
  }

  for(let program of data.programs.values()) {
    await write(programPage(program), `radio/${program.permalink}/index.html`);
  }

  for(let i = 0; i < Object.keys(data.tags).length; i++) {
    const tag = Object.keys(data.tags)[i];
    await write(tagPage(tag, data.tags[tag]), `tags/${tag}/index.html`);
  }
};
