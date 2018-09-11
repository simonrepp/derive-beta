const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Unbekannte Seite
      </div>

      <div class="title">
        Diese Seite existiert nicht.
      </div>
    </div>
  `;

  return layout(html, urbanize, { title: 'Seite nicht gefunden' });
};
