const moment = require('moment');

const authors = require('../widgets/authors.js'),
      layout = require('../layout.js'),
      tags = require('../widgets/tags.js');

module.exports = data => {
  const latest = Array.from(data.articles.values()).sort((a, b) => b.date - a.date)[0]

  // TODO: Which article should be featured ? Same question for issues, etc. probably too.

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${latest.image ? `
          <img src="${latest.image.written}" />
          Cover-Design: Elke Rauth
        `:''}
      </div>

      <div class="feature__text">
        ${authors(latest.authors)}

        <h1>${latest.title}</h1>
        <strong>${latest.subtitle}</strong>

        TODO derive N°64 (Jan–März /2016) (link auf issue)

        ${latest.abstract ? latest.abstract.html : ''}

        ${tags(latest.tags)}

        TODO Heft kaufen link auf kiosk

        TODO derive: "used with Radio" ?
        ${moment(latest.date).locale('de').format('MMMM YYYY')} (used with Radio)
      </div>
    </div>
    <div class="pagination">

    </div>
    <div class="tiles">
      TODO article special tilethingys on articles page
      ${Array.from(data.articles.values()).map(article => `
        <div class="articletile">
          <h1>
            <a href="/texte/${article.permalink}/">
              ${article.title}
            </a>
          </h1>
          <strong>
            <a href="/texte/${article.permalink}/">
              ${article.subtitle}
            </a>
          </strong>

          <a href="#">Jan Gehl</a>

          Freiburg: ça ira Verlag (2012)

          <a href="#">Rezension lesen</a>
        </div>
      `).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Texte', title: 'Texte' });
};
