const { authors } = require('../widgets/authors.js');
const { bookFeature, bookListing } = require('../widgets/books.js');
const layout = require('./layout.js');
const { SECTION_BOOKS } = require('../widgets/header.js');

module.exports = (data, currentPage) => {
    const { booksPaginated } = data;
    const { books, featured } = currentPage;

    const html = `
        ${bookFeature(featured)}
        <div class="pagination">
            ${booksPaginated.map(page =>
                `<a ${page === currentPage ? 'class="active"' : ''} href="/buecher/${page.label}/">${page.label}</a>`
            ).join('')}
        </div>
        <div class="listings">
            ${books.map(book => bookListing(book)).join('<hr>')}
        </div>
    `;

    return layout(data, html, { section: SECTION_BOOKS, title: 'Bücher' });
};
