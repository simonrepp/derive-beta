const moment = require('moment');

const authors = require('../authors.js');
const tags = require('../tags.js');

const { fullIssueTitle } = require('../issues/labeling.js');
const { stripAndTruncateHtml } = require('../../../derive-common/util.js');

module.exports = article => `
  <div class="generic__featured">
    <div class="generic__featured_image">
      ${article.image ?
        `<img src="${article.image.written}">` :
        (article.issue ? `<img src="${article.issue.cover.written}">`: '')}
      ${article.image && article.imageCaption ? `<small>${article.imageCaption}</small>` : ''}
    </div>

    <div class="generic__featured_text">
      ${authors(article.authors)}

      <h1><a href="/texte/${article.permalink}/">${article.title}</a></h1>

      ${article.subtitle ? `
        <strong>${article.subtitle}</strong><br><br>
      `:''}

      ${article.issue ? fullIssueTitle(article.issue) + '<br><br>' : ''}

      <div class="generic__margin_vertical generic__serif">
        ${article.abstract ? article.abstract.converted :
                             (article.text ? stripAndTruncateHtml(article.text.converted, 500, `/texte/${article.permalink}/`) : 'Kein Text vorhanden.')}
      </div>

      ${tags(article.tags)}

      ${article.issue && article.issue.shopLink ? `
        <strong>
          <a href="${article.issue.shopLink}">Heft kaufen</a><br><br>
        </strong>
      `:''}

      ${moment(article.date).locale('de').format('MMMM YYYY')}
    </div>
  </div>
`;
