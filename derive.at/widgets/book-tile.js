const moment = require('moment');

const authors = require('./authors.js'),
      reviews = require('./reviews.js');

module.exports = book => `
  <div class="tile">
    <h1>
      <a href="/bücher/${book.permalink}/">
        ${book.title}
      </a>
    </h1>

    ${book.cover ? `
      <img src="${book.cover.written}" />
    `:''}

    ${authors(book.authors)}

    <div class="generic__margin-vertical">
      ${[
        book.placeOfPublication ? `${book.placeOfPublication}:` : '',
        book.publishers.connected.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
        book.yearOfPublication ? `(${book.yearOfPublication})` : ''
      ].join(' ').trim()}
    </div>

    ${book.reviews.length > 1 ? reviews(book.reviews) : ''}
  </div>
`;
