const articleFeature = require('../widgets/articles/feature.js');
const authors = require('../widgets/authors.js');
const layout = require('./layout.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');

module.exports = (data, article) => {
  const html = `
    ${articleFeature(article)}

    <hr>

    ${article.authors.map(author => `
      <strong>${author.name}</strong><br>
      ${author.biography ? author.biography.converted : '<br>'}
    `).join('')}

    ${article.readable ?
      (article.text ? `<hr><div class="generic__serif">${article.text.written}</div>` :
                      '<div class="generic__margin_vertical">Kein Text vorhanden</div>')
     :
     '<div class="generic__margin_vertical">Die Zeitschrift mit dem gesamten Artikel kann online im Shop erworben werden!</div>'
    }

    <hr>

    ${article.issue && article.issue.shopLink ? `
      <a href="${article.issue.shopLink}">Heft kaufen</a>
    `:''}

    ${share(article.title, `https://derive.at/texte/${article.permalink}/`)}

    ${article.readable && article.bibliography ? `
      <hr>

      <strong>Literaturliste</strong><br>
      ${article.bibliography.converted}
    `:''}
  `;

  return layout(data, html, { activeSection: 'Texte', title: article.title });
};
