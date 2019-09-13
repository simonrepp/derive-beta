const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div>
      <h1>
        Diese Seite existiert nicht.
      </h1>
    </div>
  `;

  return layout(html, urbanize, { title: 'Seite nicht gefunden' });
};
