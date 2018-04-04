const layout = require('../src/layout.js');

module.exports = tag => {
  const html = `
    <div>
      Alle Inhalt zum Tag "${tag.name}"

      TODO tag.articles, tag.events, tag.players, etc., etc.
    </div>
  `;

  return layout(html, { title: tag.name });
};
