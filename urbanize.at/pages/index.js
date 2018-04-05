const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div class="feature-large">
      Urbanize 2018<br/><br/>

      TODO Gestaltung Index mit Elke<br/><br/>

      ${urbanize.events.length} Veranstaltungen<br/>
      ${urbanize.pages.length} Seiten<br/>
      ${urbanize.participants.size} Teilnehmer<br/>
      ${Object.keys(urbanize.categories).length} Kategorien<br/>
      ${Object.keys(urbanize.tags).length} Tags<br/>
    </div>
  `;

  return layout(html, urbanize);
};
