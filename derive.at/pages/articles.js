const moment = require('moment');

const authors = require('../widgets/authors.js');
const layout = require('./layout.js');
const panel = require('../widgets/articles/panel.js');
const tags = require('../widgets/tags.js');

const { fullIssueTitle } = require('../widgets/issues/labeling.js');
const { stripAndTruncateHtml } = require('../../derive-common/util.js');

module.exports = (data, pagination) => {
  const { articles, featured } = pagination;

  const html = `
    <div class="featured">

      <div class="featured__image">
        ${featured.image ? `
          <img src="${featured.image.written}" />
        ` : `
          ${featured.issue ? `
            <img src="${featured.issue.cover.written}" />
          `:''}
        `}
      </div>

      <div class="featured__text">
        ${authors(featured.authors)}

        <h1>${featured.title}</h1>

        ${featured.subtitle ? `
          <strong>${featured.subtitle}</strong><br/><br/>
        `:''}

        ${featured.issue ? fullIssueTitle(featured.issue) : ''}<br/><br/>

        <div class="generic__serif">
          ${featured.abstract ? featured.abstract.converted :
                                (featured.text ? stripAndTruncateHtml(featured.text.converted, 500) :
                                                 '')}
        </div>

        ${tags(featured.tags)}

        ${featured.issue && featured.issue.shopLink ? `
          <strong>
            <a href="${featured.issue.shopLink}">Heft kaufen</a><br/><br/>
          </strong>
        `:''}

        ${moment(featured.date).locale('de').format('MMMM YYYY')}
      </div>
    </div>

    <div class="pagination">
      ${data.articlesPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/texte/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div>
      ${articles.map(panel).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Texte', title: 'Texte' });
};
