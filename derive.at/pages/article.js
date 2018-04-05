const authors = require('../widgets/authors.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (article) => {
  const html = `
    <div class="article-single">

      ${article.image ? `<img src="${article.image.written}" />` : ''}

      ${authors(article.authors)}

      <h1>${article.title}</h1>
      ${article.subtitle ? `<strong>${article.subtitle}</strong>` : ''}

      ${article.text ? article.text.written : 'Kein Text vorhanden'}

      ${tags(article.tags.connected)}

      ${article.issue && article.issue.shopLink ? `
        <a href="${article.issue.shopLink}">Heft kaufen</a>
      `:''}

      ${share(article.title, `https://derive.at/texte/${article.permalink}/`)}
    </div>

    <hr/>
  `;

  return layout(html, { activeSection: 'Texte', title: article.title });
};
