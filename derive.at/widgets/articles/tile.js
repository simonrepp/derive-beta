const authors = require('../authors.js');

module.exports = article => `
  <div class="tile">
    <div class="tile_header">
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

    ${article.issue ? `
      <div class="tile_image_split">
        <div class="tile_image_split__image">
          <img src="${article.issue.cover.written}">
        </div>
        <div class="tile_image_split__meta">
        <a href="/zeitschrift/${article.issue.permalink}/">dérive N°${article.issue.number}</a><br/>
          Seite ${article.inIssueOnPages}
        </div>
      </div>
    `:''}
  </div>
`;
