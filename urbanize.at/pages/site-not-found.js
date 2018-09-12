const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="generic__heading">
        Diese Seite existiert nicht.
      </div>
    </div>
  `;

  return layout(html, urbanize, { title: 'Seite nicht gefunden' });
};
