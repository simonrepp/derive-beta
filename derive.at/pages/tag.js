const layout = require('./layout.js'),
      articleTile = require('../widgets/articles/tile.js'),
      bookTile = require('../widgets/book-tile.js'),
      eventTile = require('../widgets/event-tile.js'),
      programTile = require('../widgets/program-tile.js');

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

      ${tag.events ? `
        <h1>Veranstaltungen</h1>

        <div class="tiles">
          ${tag.events.map(eventTile).join('')}
        </div>
      `:''}
    </div>
  `;

  return layout(data, html, { title: tag.name });
};
