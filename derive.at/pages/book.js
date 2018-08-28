const bookFeature = require('../widgets/books/feature.js');
const layout = require('./layout.js');

module.exports = (data, book) => {
  const html = bookFeature(book);

  return layout(data, html, { activeSection: 'Bücher', title: book.title });
};
