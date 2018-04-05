const authors = require('../widgets/authors.js'),
      bookTile = require('../widgets/book-tile.js'),
      layout = require('./layout.js'),
      reviews = require('../widgets/reviews.js'),
      share = require('../widgets/share.js');

module.exports = (data, pagination) => {
  const first = pagination.books[0];

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${first.cover ? `<img src="${first.cover.written}" />` : ''}
      </div>

      <div class="feature__text">
        ${authors(first.authors)}

        <h1>${first.title}</h1>

        ${first.description ? first.description ? : ''}

        <div class="generic__margin-vertical">
          ${[
            first.placeOfPublication ? `${first.placeOfPublication}:` : '',
            first.publishers.connected.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
            first.yearOfPublication ? `(${first.yearOfPublication})` : ''
          ].join(' ').trim()}
        </div>

        ${first.reviews.length > 1 ? `<strong>${reviews(first.reviews)}</strong>` : ''}

        <hr class="hr__light" />

        ${share(first.title, `/bücher/${first.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      ${data.booksPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/bücher/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div class="tiles">
      ${pagination.books.map(bookTile).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Bücher', title: 'Bücher' });
};
