const moment = require('moment');

const authors = require('../widgets/authors.js'),
      { fullIssueTitle } = require('../widgets/issue-labeling.js'),
      layout = require('./layout.js'),
      { random } = require('../util.js'),
      tags = require('../widgets/tags.js');



module.exports = (data, pagination) => {
  const featured = random(pagination.articles);

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${featured.image ? `<img src="${featured.image.written}" />` : ''}
      </div>

      <div class="feature__text">
        ${authors(featured.authors)}

        <h1>${featured.title}</h1>

        ${featured.subtitle ? `
          <strong>${featured.subtitle}</strong>
        `:''}

        ${featured.issue ? fullIssueTitle(featured.issue) : ''}<br/>

        ${featured.abstract ? featured.abstract.html : ''}

        ${tags(featured.tags.connected)}

        ${featured.issue && featured.issue.shopLink ? `
          <a href="${featured.issue.shopLink}">Heft kaufen</a>
        `:''}

        TODO derive: "used with Radio" ?
        ${moment(featured.date).locale('de').format('MMMM YYYY')} (used with Radio)
      </div>
    </div>

    <div class="pagination">
      ${data.articlesPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/texte/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div class="tiles">
      TODO article special tilethingys on articles page
      ${pagination.articles.map(article => `
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
