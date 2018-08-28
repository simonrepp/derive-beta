const layout = require('./layout.js'),
      articleTile = require('../widgets/articles/tile.js'),
      bookTile = require('../widgets/books/tile.js'),
      eventTile = require('../widgets/event-tile.js'),
      programTile = require('../widgets/program-tile.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, author) => {
  const html = `
    <div>
      <h1>${author.name}</h1>

      ${author.biography ? `<strong>${author.biography.converted}</strong>` : ''}

      ${author.text ? `
        ${author.text.converted}
      `:''}

      ${author.website ? `
        <a href="${author.website}">Zur Website von ${author.name}</a>
      `:''}

      ${tags(author.tags)}
    </div>

    ${author.articles && author.articles.length > 0 ? `
      <h1>Artikel</h1>

      <div class="tiles">
        ${author.articles.map(articleTile).join('')}
      </div>
    `:''}

    ${author.books && author.books.length > 0 ? `
      <h1>Bücher</h1>

      <div class="tiles">
        ${author.books.map(bookTile).join('')}
      </div>
    `:''}

    ${author.programs && author.programs.length > 0 ? `
      <h1>Radio</h1>

      <div class="tiles">
        ${author.programs.map(programTile).join('')}
      </div>

    `:''}

    ${author.events && author.events.length > 0 ? `
      <h1>Veranstaltungen</h1>

      <div class="tiles">
        ${author.events.map(eventTile).join('')}
      </div>
    `:''}
  `;

  return layout(data, html, { activeSection: 'Autoren', title: author.name });
};
