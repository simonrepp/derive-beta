const moment = require('moment');

const authors = require('./authors.js');

module.exports = article => `
  <div class="tile">
    <h1>
      <a href="/texte/${article.permalink}/">
        ${article.title}
      </a>
    </h1>
    ${article.subtitle ? `
      <h2>
        <a href="/texte/${article.permalink}/">
          ${article.subtitle}
        </a>
      </h2>
    `:''}

    ${article.image ? `
      <img src="${article.image.written}" /><br/><br/>
    `:''}

    ${article.issue ? `Ausgabe ${article.issue.year} / ${article.issue.quarter}<br/><br/>` : ''}
    ${article.inIssueOnPages ? `Seiten: ${article.inIssueOnPages}<br/><br/>` : ''}
  </div>
`;
