const authors = require('../authors.js'),
      tags = require('../tags.js');

const infoDetails = article => `
  <strong>Autor*innen</strong><br/>
  ${authors(article.authors.connected)}

  <br/><br/>

  ${article.issue ? `
    <strong>Ausgabe</strong><br/>
    <a href="/zeitschrift/${article.issue.number}">
      N°${article.issue.number} (Seite ${article.inIssueOnPages})
    </a>

    <br/><br/>
  `:''}

  ${tags(article.tags.connected)}

  ${article.issue ? `
    <strong>
      <a href="${article.issue.shopLink}">
        Heft kaufen
      </a>
    </strong>
  `:''}
`;

const info = article => `
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

    <div class="article-panel__abstract">
      ${article.abstract ? article.abstract.sourced : ''}
    </div>
  </div>
`;
