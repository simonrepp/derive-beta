const bookFeature = require('../widgets/books/feature.js');
const layout = require('./layout.js');

module.exports = (data, book) => {
  const html = `
    ${bookFeature(book)}

    <hr/>

    <h2>Verlagsinformationen</h2>

    TODO: Wo kommt dieser Datensatz her?

    <hr/>
  `;

  return layout(data, html, { activeSection: 'Bücher', title: book.title });
};
