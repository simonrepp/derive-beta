const printLayout = require('./layout-print.js');

module.exports = (data, article) => {
  const html = `
    ${article.authors.connected.map(author => author.name).join(', ')}

    <h1>${article.title}</h1>
    <strong>${article.subtitle}</strong>

    ${article.text}
`;

  return printLayout(data, html, { activeSection: 'Texte', title: article.title });
};
