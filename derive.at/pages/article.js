const authors = require('../widgets/authors.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, article) => {
  const html = `
    <div class="article-single">

      ${article.image ? `<img src="${article.image.written}" />` : ''}

      ${authors(article.authors)}

      <h1>${article.title}</h1>
      ${article.subtitle ? `<strong>${article.subtitle}</strong>` : ''}

      ${article.abstract ? article.abstract.converted : ''}

      ${article.issue && article.issue.shopLink ? `
        <a href="${article.issue.shopLink}">Heft kaufen</a>
      `:''}

      ${share(article.title, `https://derive.at/texte/${article.permalink}/`)}
    </div>

    <hr/>

    ${tags(article.tags)}

    ${article.authors.map(author => `
      <strong>${author.name}</strong><br/>
      ${author.biography ? `
        ${author.biography.converted}
      `:''}<br/><br/>
    `).join('')}

    ${article.readable ? `
      <hr/>

      ${article.text ? article.text.written : 'Kein Text vorhanden'}
    `:`
      Die Zeitschrift mit dem gesamten Artikel kann online im Shop erworben werden!
    `}

    <hr/>

    ${article.issue && article.issue.shopLink ? `
      <a href="${article.issue.shopLink}">Heft kaufen</a>
    `:''}

    ${share(article.title, `https://derive.at/texte/${article.permalink}/`)}

    ${article.bibliography ? `
      <hr/>

      <strong>Literaturliste</strong><br/>
      ${article.bibliography.converted}
    `:''}
  `;

  return layout(data, html, { activeSection: 'Texte', title: article.title });
};
