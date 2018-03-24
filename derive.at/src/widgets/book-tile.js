const moment = require('moment');

const authors = require('./authors.js');

module.exports = book => `
  <div class="tile">
    <h1>
      <a href="/bücher/${book.permalink}/">
        ${book.title}
      </a>
    </h1>

    ${book.image ? `
      <img src="${book.image}" />
    `:''}

    ${authors(book.authors)}

    <div class="generic__margin-vertical">
      ${[
        book.placeOfPublication ? `${book.placeOfPublication}:` : '',
        book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
        book.yearOfPublication ? `(${book.yearOfPublication})` : ''
      ].join(' ').trim()}
    </div>

    ${book.reviews ? `
      <a href="/texte/${book.reviews[0].permalink}/">Rezension lesen</a>
    `:''}
  </div>
`;
