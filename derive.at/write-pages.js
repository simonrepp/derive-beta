const { writeFile } = require('../derive-common/util.js');

const articlePage = require('./pages/article.js');
const articlePrintPage = require('./pages/article-print.js');
const articlesPage = require('./pages/articles.js');
const authorPage = require('./pages/author.js');
const authorsPage = require('./pages/authors.js');
const bookPage = require('./pages/book.js');
const eventPage = require('./pages/event.js');
const booksPage = require('./pages/books.js');
const festivalPage = require('./pages/festival.js');
const indexPage = require('./pages/index.js');
const issuePage = require('./pages/issue.js');
const issuesPage = require('./pages/issues.js');
const siteNotFoundPage = require('./pages/site-not-found.js');
const pagePage = require('./pages/page.js');
const publisherPage = require('./pages/publisher.js');
const programPage = require('./pages/program.js');
const programsPage = require('./pages/programs.js');
const screeningPage = require('./pages/screening.js');
const screeningsPage = require('./pages/screenings.js');
const searchPage = require('./pages/search.js');
const tagPage = require('./pages/tag.js');

module.exports = async data => {
  await Promise.all([
    writeFile(data.buildDir, 'texte/index.html', articlesPage(data, data.articlesPaginated[0])),
    writeFile(data.buildDir, 'autoren/index.html', authorsPage(data)),
    writeFile(data.buildDir, 'buecher/index.html', booksPage(data, data.booksPaginated[0])),
    writeFile(data.buildDir, 'festival/index.html', festivalPage(data)),
    writeFile(data.buildDir, 'index.html', indexPage(data)),
    writeFile(data.buildDir, 'zeitschrift/index.html', issuesPage(data)),
    writeFile(data.buildDir, 'seite-nicht-gefunden/index.html', siteNotFoundPage(data)),
    writeFile(data.buildDir, 'radio/index.html', programsPage(data, data.programsPaginated[0])),
    writeFile(data.buildDir, 'kino/index.html', screeningsPage(data)),
    writeFile(data.buildDir, 'suche/index.html', searchPage(data))
  ]);

  for(const pagination of data.articlesPaginated) {
    await writeFile(data.buildDir, `texte/${pagination.label}/index.html`, articlesPage(data, pagination));
  }

  for(const article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/index.html`, articlePage(data, article));
  }

  for(const article of data.articles.values()) {
    await writeFile(data.buildDir, `texte/${article.permalink}/druckversion/index.html`, articlePrintPage(data, article));
  }

  for(const author of data.authors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(data, author));
  }

  for(const pagination of data.authorsPaginated) {
    await writeFile(data.buildDir, `autoren/${pagination.label}/index.html`, authorsPage(data, pagination));
  }

  for(const pagination of data.booksPaginated) {
    await writeFile(data.buildDir, `buecher/${pagination.label}/index.html`, booksPage(data, pagination));
  }

  for(const author of data.bookAuthors) {
    await writeFile(data.buildDir, `autoren/${author.permalink}/index.html`, authorPage(data, author));
  }

  for(const event of data.events.values()) {
    await writeFile(data.buildDir, `veranstaltungen/${event.permalink}/index.html`, eventPage(data, event));
  }

  for(const issue of data.issues.values()) {
    await writeFile(data.buildDir, `zeitschrift/${issue.permalink}/index.html`, issuePage(data, issue));
  }

  for(const page of data.derivePages) {
    await writeFile(data.buildDir, `${page.permalink}/index.html`, pagePage(data, page));
  }

  for(const publisher of data.publishers) {
    await writeFile(data.buildDir, `verlage/${publisher.permalink}/index.html`, publisherPage(data, publisher));
  }

  for(const book of data.books.values()) {
    await writeFile(data.buildDir, `buecher/${book.permalink}/index.html`, bookPage(data, book));
  }

  for(const pagination of data.programsPaginated) {
    await writeFile(data.buildDir, `radio/${pagination.label}/index.html`, programsPage(data, pagination));
  }

  for(const program of data.programs.values()) {
    await writeFile(data.buildDir, `radio/${program.permalink}/index.html`, programPage(data, program));
  }

  for(const screening of data.screenings.values()) {
    await writeFile(data.buildDir, `kino/${screening.permalink}/index.html`, screeningPage(data, screening));
  }

  for(const tag of data.tags.values()) {
    await writeFile(data.buildDir, `tags/${tag.permalink}/index.html`, tagPage(data, tag));
  }
};
