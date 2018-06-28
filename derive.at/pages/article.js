const authors = require('../widgets/authors.js');
const layout = require('./layout.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');

const { stripAndTruncateHtml } = require('../../derive-common/util.js');

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
      ${article.abstract ? article.abstract.converted : (article.text ? stripAndTruncateHtml(article.text.converted, 250) : '')}

      <br/><br/>

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
