const bookFeature = require('../widgets/books/feature.js');
const bookTile = require('../widgets/books/tile.js');
const layout = require('./layout.js');

module.exports = (data, pagination) => {
  const { books, featured } = pagination;

  const html = `
    ${bookFeature(featured)}

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
