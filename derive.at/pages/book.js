const { bookFeature } = require('../widgets/books.js');
const layout = require('./layout.js');
const { SECTION_BOOKS } = require('../widgets/header.js');

module.exports = (data, book) => {
    const html = bookFeature(book);
    return layout(data, html, { section: SECTION_BOOKS, title: book.title });
};
