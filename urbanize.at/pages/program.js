const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="generic__heading">
        Programm
      </div>

      <a class="filter" data-filter="all">Alles anzeigen</a> &nbsp;&nbsp;
      <a class="filter" data-filter="day">Bestimmter Tag</a> &nbsp;&nbsp;
      <a class="filter" data-filter="format">Bestimmtes Format</a> &nbsp;&nbsp;
      <a class="filter" data-filter="alltagsforschung">Alltagsforschung</a> &nbsp;&nbsp;
      <a class="filter" data-filter="stadtlabor">Stadtlabor</a> &nbsp;&nbsp;

      <br><br>

      [Sortierung frueher oben, spaeter unten (zb. MO oben, DI unten)]<br><br>

      ${eventListing(Object.values(urbanize.events))}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: 'Programm' });
};
