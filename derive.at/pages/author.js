const layout = require('./layout.js'),
      articleTile = require('../widgets/article-tile.js'),
      bookTile = require('../widgets/book-tile.js'),
      eventTile = require('../widgets/event-tile.js'),
      programTile = require('../widgets/program-tile.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, author) => {
  const html = `
    <div>
      <h1>${author.name}</h1>

      ${author.biography ? `<strong>${author.biography.sourced}</strong>` : ''}

      ${author.text ? `
        ${author.text.sourced}
      `:''}

      ${author.website ? `
        <a href="${author.website}">Zur Website von ${author.name}</a>
      `:''}

      ${tags(author.tags.connected)}
    </div>

    ${author.articles ? `
      <h1>Artikel</h1>

      <div class="tiles">
        ${author.articles.map(articleTile).join('')}
      </div>
    `:''}

    ${author.books ? `
      <h1>Bücher</h1>

      <div class="tiles">
        ${author.books.map(bookTile).join('')}
      </div>
    `:''}

    ${author.programs ? `
      <h1>Radio</h1>

      <div class="tiles">
        ${author.programs.map(programTile).join('')}
      </div>

    `:''}

    ${author.events ? `
      <h1>Veranstaltungen</h1>

      <div class="tiles">
        ${author.events.map(eventTile).join('')}
      </div>
    `:''}
  `;

  return layout(data, html, { activeSection: 'Autoren', title: author.name });
};
