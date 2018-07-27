const authors = require('../widgets/authors.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      reviews = require('../widgets/reviews.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, book) => {
  const html = `
    <div class="featured">

      <div class="featured__image">
        ${book.cover ? `<img src="${book.cover.written}" />` : ''}
      </div>

      <div class="featured__text">
        ${authors(book.authors)}

        <h1>${book.title}</h1>

        Aufgrund schlechter Transportbedingungen und vor allem der wenigen und technisch nicht ausgereiften Konservierungsmöglichkeiten waren der Anbau von Obst und Gemüse sowie die Haltung von Vieh notwendigerweise städtische Praktiken (Stierand 2008): Überwiegend (urban)landwirtschaftlich genutzte Freiflächen bestimmten das Stadtbild, Märkte bildeten einen räumlichen und sozialen Mittelpunkt.

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

    Verlagsinformationen: Seit einigen Jahren ist die Auseinandersetzung mit der Theorie der Produktion des Raumes in eine neue Phase getreten. Während in den 1970er und 1980er Jahren. "Wäschezetteltext" Seit einigen Jahren ist die Auseinandersetzung mit der Theorie der Produktion des Raumes in eine neue Phase getreten. Während in den 1970er und 1980er Jahren.

    <hr/>
  `;

  return layout(data, html, { activeSection: 'Bücher', title: book.title });
};
