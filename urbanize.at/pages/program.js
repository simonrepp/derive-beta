const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  const html = `
    <div>
      <h1>
        Programm
      </h1>

      <a class="button_rect_pink filter" data-filter="date">Datum</a> &nbsp;&nbsp;
      <a class="button_rect_pink filter" data-filter="category">Kategorie</a> &nbsp;&nbsp;
      <a class="button_rect_pink filter" data-filter="query">Volltextsuche</a> &nbsp;&nbsp;

      <br><br>

      ${eventListing(Object.values(urbanize.events))}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: 'Programm' });
};
