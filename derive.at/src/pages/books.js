const authors = require('../widgets/authors.js'),
      bookTile = require('../widgets/book-tile.js'),
      layout = require('../layout.js'),
      share = require('../widgets/share.js');

module.exports = data => {
  const latest = Array.from(data.books.values()).sort((a, b) => a.yearOfPublication > b.yearOfPublication)[0];

  const html = `
    <div class="feature">

      <div class="feature__image">
        <img src="${latest.image}" />
        Cover-Design: TODO Elke Rauth
      </div>

      <div class="feature__text">
        ${authors(latest.authors)}

        <h1>${latest.title}</h1>

        ${latest.description}

        <div class="generic__margin-vertical">
          ${[
            latest.placeOfPublication ? `${latest.placeOfPublication}:` : '',
            latest.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
            latest.yearOfPublication ? `(${latest.yearOfPublication})` : ''
          ].join(' ').trim()}
        </div>

        ${latest.reviews ? `
          <strong>
            <a href="/texte/${latest.reviews[0].permalink}/">Rezension lesen</a>
          </strong>
        `:''}

        <hr class="hr__light" />

        ${share(latest.title, `/bücher/${latest.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      <span class="icon-previous"></span> 1 / 190 TODO <span class="icon-next"></span>
    </div>

    <div class="tiles">
      ${Array.from(data.books.values()).map(bookTile).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Bücher', title: 'Bücher' });
};
