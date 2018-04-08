const moment = require('moment');

const authors = require('../widgets/authors.js'),
      { fullIssueTitle } = require('../widgets/issue-labeling.js'),
      layout = require('./layout.js'),
      tags = require('../widgets/tags.js');



module.exports = (data, pagination) => {
  const { articles, featured } = pagination;

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

    TODO article special tilethingys on articles page

    <div class="tiles">
      ${articles.map(article => `
        <div class="article-big-tile">
          <h1>
            <a href="/texte/${article.permalink}/">
              ${article.title}
            </a>
          </h1>

          ${article.subtitle ? `
            <strong>
              <a href="/texte/${article.permalink}/">
                ${article.subtitle}
              </a>
            </strong>
          `:''}

          ${article.issue ? `
            <img src="${article.issue.cover.written}"
          `:''}

          <strong>Autor*innen</strong><br/>
          ${authors(article.authors.connected)}

          ${article.issue ? `
            <strong>Ausgabe</strong><br/>
            <a href="/zeitschrift/${article.issue.number}">
              N°${article.issue.number} (Seite ${article.inIssueOnPages})
            </a>
          `:''}

          ${tags(article.tags.connected)}

          ${article.issue ? `
            <strong>
              <a href="${article.issue.shopLink}">
                Heft kaufen
              </a>
            </strong>
          `:''}

          ${article.abstract ? article.abstract : ''}
        </div>
      `).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Texte', title: 'Texte' });
};
