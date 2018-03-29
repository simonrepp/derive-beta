const layout = require('../layout.js');

module.exports = () => {
  const html = `
    <div>
      Diese Seite existiert nicht
    </div>
  `;

  return layout(html, { title: 'Seite nicht gefunden' });
};
