const layout = require('./layout.js');
const articleTile = require('../widgets/articles/tile.js');
const bookTile = require('../widgets/books/tile.js');
const programTile = require('../widgets/program-tile.js');

module.exports = (data, tag) => {
  const html = `
    <div>
      Alle Inhalt zum Tag "${tag.name}"

      ${tag.articles ? `
        <h1>Artikel</h1>

        <div class="tiles">
          ${tag.articles.map(articleTile).join('')}
        </div>
      `:''}

      ${tag.books ? `
        <h1>Bücher</h1>

        <div class="tiles">
          ${tag.books.map(bookTile).join('')}
        </div>
      `:''}

      ${tag.programs ? `
        <h1>Radio</h1>

        <div class="tiles">
          ${tag.programs.map(programTile).join('')}
        </div>

      `:''}
    </div>
  `;

  return layout(data, html, { title: tag.name });
};
