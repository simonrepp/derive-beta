const bookTile = require('../widgets/book-tile.js'),
      layout = require('./layout.js'),
      tags = require('../widgets/tags.js');

// TODO: Centered reduced simple layout for Verlag and Autor Page

module.exports = (data, publisher) => {
  const html = `
    <div>
      <h1>${publisher.name}</h1>

      ${publisher.biography ? `<strong>${publisher.biography}</strong>` : ''}

      ${publisher.text ? `
        ${publisher.text}
      `:''}

      ${[publisher.country, publisher.city].filter(Boolean).join(', ')}<br/>
      ${publisher.website ? `
        <a href="${publisher.website}">Zur Website von ${publisher.name}</a>
      `:''}
    </div>

    ${publisher.publishedBooks ? `
      <h1>Weitere Publikationen bei ${publisher.name}</h1>

      <div class="tiles">
        ${publisher.publishedBooks.map(bookTile).join('')}
      </div>
    `:''}
  `;

  return layout(data, html, { activeSection: 'Bücher', title: publisher.name });
};
