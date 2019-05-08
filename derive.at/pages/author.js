const layout = require('./layout.js');
const articleTile = require('../widgets/articles/tile.js');
const bookTile = require('../widgets/books/tile.js');
const programTile = require('../widgets/program-tile.js');
const tags = require('../widgets/tags.js');

module.exports = (data, author) => {
  const html = `
    <div>
      <h1>${author.name}</h1>

      ${author.text ?
        author.text.converted :
        (author.biography ? author.biography.converted : '')}

      ${author.website ? `
        <a href="${author.website}">Zur Website von ${author.name}</a>
      `:''}

      ${tags(author.tags)}
    </div>

    ${author.articles && author.articles.length > 0 ? `
      <h1>Artikel</h1>

      <div class="tiles">
        ${author.articles.sort((a, b) => b.date - a.date).map(articleTile).join('')}
      </div>
    `:''}

    ${author.authoredBooks && author.authoredBooks.length > 0 ||
      author.publishedBooks && author.publishedBooks.length > 0 ? `
      <h1>Bücher</h1>

      <div class="tiles">
        ${author.authoredBooks ? author.authoredBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookTile).join('') : ''}
        ${author.publishedBooks ? author.publishedBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookTile).join('') : ''}
      </div>
    `:''}

    ${author.programs && author.programs.length > 0 ? `
      <h1>Radio</h1>

      <div class="tiles">
        ${author.programs.sort((a, b) => b.firstBroadcast - a.firstBroadcast).map(programTile).join('')}
      </div>

    `:''}
  `;

  return layout(data, html, { activeSection: 'Autoren', title: author.name });
};
