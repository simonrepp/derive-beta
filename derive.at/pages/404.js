const layout = require('./layout.js');

module.exports = data => {
  const html = `
    <div>
      Diese Seite existiert nicht
    </div>
  `;

  return layout(data, html, { title: 'Seite nicht gefunden' });
};
