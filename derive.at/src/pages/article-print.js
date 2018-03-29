const printLayout = require('../layout-print.js');

module.exports = (article) => {
  const html = `
    ${article.authors.connected.map(author => author.name).join(', ')}

    <h1>${article.title}</h1>
    <strong>${article.subtitle}</strong>

    ${article.text}
`;

  return printLayout(html, { activeSection: 'Texte', title: article.title });
};
