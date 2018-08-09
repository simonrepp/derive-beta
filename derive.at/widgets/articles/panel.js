const authors = require('../authors.js');
const tags = require('../tags.js');
const { stripAndTruncateHtml } = require('../../../derive-common/util.js');

const infoDetails = article => `
  <strong>Autor*innen</strong><br/>
  ${authors(article.authors)}

  <br/><br/>

  ${article.issue ? `
    <strong>Ausgabe</strong><br/>
    <a class="generic__smaller_text"
       href="/zeitschrift/${article.issue.permalink}">
      N°${article.issue.number} (Seite ${article.inIssueOnPages})
    </a>

    <br/><br/>
  `:''}

  ${tags(article.tags)}

  ${article.issue ? `
    <strong>
      <a href="${article.issue.shopLink}">
        Heft kaufen
      </a>
    </strong>
  `:''}
`;

const info = article => `
  <div class="generic__heading">
    <a href="/texte/${article.permalink}/">
      ${article.title}
    </a>
  </div>

  ${article.subtitle ? `
    <div class="generic__subheading">
      <a href="/texte/${article.permalink}/">
        ${article.subtitle}
      </a>
    </div>
  `:''}

  <div class="article-panel__info-split">

    <div class="article-panel__info-cover">
      ${article.issue ? `
        <img src="${article.issue.cover.written}">
      `:''}
    </div>

    <div class="article-panel__info-details">
      ${infoDetails(article)}
    </div>
  </div>
`;

module.exports = article => `
  <div class="article-panel">
    <div class="article-panel__info">
      ${info(article)}
    </div>

    <div class="article-panel__abstract generic__serif">
      ${article.abstract ? article.abstract.converted :
                           (article.text ? stripAndTruncateHtml(article.text.converted, 500) :
                                           '')}
    </div>
  </div>
`;
