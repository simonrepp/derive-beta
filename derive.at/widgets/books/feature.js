const authors = require('../authors.js');
const reviews = require('./reviews.js');
const share = require('../share.js');
const tags = require('../tags.js');

module.exports = book => `
  <div class="generic__featured">

    <div class="generic__featured_image">
      ${book.cover ? `<img src="${book.cover.written}" />` : ''}
    </div>

    <div class="generic__featured_text">
      ${authors(book.authors)}

      <h1>${book.title}</h1>

      ${book.description ? `<div class="generic__serif">${book.description.converted}</div>` : ''}

      <div class="generic__margin_vertical">
        ${[
          book.placeOfPublication ? `${book.placeOfPublication}:` : '',
          book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
          book.yearOfPublication ? `(${book.yearOfPublication})` : ''
        ].join(' ').trim()}
      </div>

      ${book.reviews.length > 0 ? `<strong>${reviews(book.reviews)}</strong>` : ''}

      ${tags(book.tags)}

      ${share(book.title, `/bücher/${book.permalink}/`)}
    </div>
  </div>
`.trim();
