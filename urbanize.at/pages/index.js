const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div class="featured-large">
      Urbanize 2018<br/><br/>

      TODO Gestaltung Index mit Elke<br/><br/>

      ${urbanize.events.length} Veranstaltungen<br/>
      ${urbanize.pages.length} Seiten<br/>
      ${urbanize.participants.size} Teilnehmer<br/>
      ${urbanize.categories.size} Kategorien<br/>
      ${urbanize.tags.size} Tags<br/>
    </div>
  `;

  return layout(html, urbanize);
};
