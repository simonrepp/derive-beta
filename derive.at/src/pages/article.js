const authors = require('../widgets/authors.js'),
      layout = require('../layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (article) => {
  const html = `
    <div class="article-single">

      ${article.image ? `
        <img src="${article.image}" />
      `:''}
      Cover-Design: Someone STATIC TODO

      ${authors(article.authors)}

      <h1>${article.title}</h1>
      <strong>${article.subtitle}</strong>

      ${article.text}

      ${tags(article.tags)}

      <a href="#">Heft kaufen</a>

      ${share(article.title, `https://derive.at/texte/${article.permalink}/`)}
    </div>

    <hr/>
  `;

  return layout(html, { activeSection: 'Texte', title: article.title });
};
