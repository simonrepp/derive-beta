const authors = require('../widgets/authors.js');
const layout = require('./layout.js');
const share = require('../widgets/share.js');
const reviews = require('../widgets/reviews.js');
const tags = require('../widgets/tags.js');

module.exports = (data, book) => {
  const html = `
    <div class="featured">

      <div class="featured__image">
        ${book.cover ? `<img src="${book.cover.written}" />` : ''}
      </div>

      <div class="featured__text">
        ${authors(book.authors)}

        <h1>${book.title}</h1>

        ${book.description ? `<div class="generic__serif">${book.description.converted}</div>` : ''}

        <div class="generic__margin-vertical">
          ${[
            book.placeOfPublication ? `${book.placeOfPublication}:` : '',
            book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
            book.yearOfPublication ? `(${book.yearOfPublication})` : ''
          ].join(' ').trim()}
        </div>

        ${book.reviews.length > 1 ? `<strong>${reviews(book.reviews)}</strong>` : ''}

        ${tags(book.tags)}

        <hr class="hr__light" />

        <div class="generic__right-aligned">
          ${share(book.title, `/bücher/${book.permalink}/`)}
        </div>
      </div>
    </div>

    <hr/>

    <h2>Verlagsinformationen</h2>

    TODO: Wo kommt dieser Datensatz her?

    <hr/>
  `;

  return layout(data, html, { activeSection: 'Bücher', title: book.title });
};
