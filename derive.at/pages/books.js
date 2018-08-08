const authors = require('../widgets/authors.js'),
      bookTile = require('../widgets/book-tile.js'),
      layout = require('./layout.js'),
      reviews = require('../widgets/reviews.js'),
      share = require('../widgets/share.js');

module.exports = (data, pagination) => {
  const { books, featured } = pagination;

  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        ${featured.cover ? `<img src="${featured.cover.written}" />` : ''}
      </div>

      <div class="generic__featured_text">
        ${authors(featured.authors)}

        <h1>${featured.title}</h1>

        ${featured.description ? `<div class="generic__serif">${featured.description.converted}</div>` : ''}

        <div class="generic__margin-vertical">
          ${[
            featured.placeOfPublication ? `${featured.placeOfPublication}:` : '',
            featured.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
            featured.yearOfPublication ? `(${featured.yearOfPublication})` : ''
          ].join(' ').trim()}
        </div>

        ${featured.reviews.length > 1 ? `<strong>${reviews(featured.reviews)}</strong>` : ''}

        <hr class="hr__light" />

        ${share(featured.title, `/bücher/${featured.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      ${data.booksPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/bücher/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div class="tiles">
      ${books.map(bookTile).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Bücher', title: 'Bücher' });
};
