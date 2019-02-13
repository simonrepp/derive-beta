const authors = require('../authors.js');

const article = article => `
  <div class="section-article__split">
    <div class="section-article__info">
      ${authors(article.authors)}<br>
      Seite: ${article.inIssueOnPages}<br>
      <a href="/texte/${article.permalink}/">
        ${article.readable ? 'Artikel lesen' : 'Abstract lesen'}
      </a>
    </div>

    <div class="section-article__title">
      <h2 class="generic__no_margin">
        <a href="/texte/${article.permalink}/">
          ${article.title}
        </a>
      </h2>
      ${article.subtitle ? `
        <h3 class="generic__margin_vertical_slight">
          <a href="/texte/${article.permalink}/">
            ${article.subtitle}
          </a>
        </h3>
      `:''}
    </div>
  </div>
`;

module.exports = section => `
  <hr class="hr__light">

  <h1>${section.title}</h1>

  ${section.articles.map(article).join('')}
`;
