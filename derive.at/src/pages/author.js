const layout = require('../layout.js'),
      articleTile = require('../widgets/article-tile.js'),
      bookTile = require('../widgets/book-tile.js'),
      programTile = require('../widgets/program-tile.js'),
      tags = require('../widgets/tags.js');

module.exports = (author) => {
  const html = `
    <div>
      <h1>${author.name}</h1>
        
      ${author.bio ? `<strong>${author.bio}</strong>` : ''}

      ${author.text ? `
        ${author.text}
      `:''}

      ${author.website ? `
        <a href="${author.website}">Zur Website von ${author.name}</a>
      `:''}

      ${tags(author.tags)}
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

      ${author.events.length} TODO!
    `:''}
  `;

  return layout(html, { activeSection: 'Autoren', title: author.name });
};
