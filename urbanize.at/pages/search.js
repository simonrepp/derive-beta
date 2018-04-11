const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="search__results">
        Suche läuft ...
      </div>
    </div>
  `;

  return layout(html, urbanize, { title: 'Suche' });
};
