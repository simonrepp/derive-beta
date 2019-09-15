const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  const html = `
    <div>
      <h2>
        Filtern nach
      </h2>

      <script type="text/javascript">
        function filterEvents(type, value) {
          for(const event of document.querySelectorAll('.event_filterable')) {
            if(type === 'date') {
              event.style.display = event.dataset.date === value ? 'block' : 'none';
            }

            if(type === 'category') {
              event.style.display = event.dataset.category === value ? 'block' : 'none';
            }
          }
        };
      </script>

      <span class="hover_menu_trigger">
        <a class="button_rect_pink" data-filter="date" href="/">Datum</a>
        <div class="hover_menu">
          <a class="button_rect_yellow" data-date="2019-10-09" href="#" onclick="filterEvents('date', this.dataset.date); return false;">9 OKT 2019</a>
          <a class="button_rect_yellow" data-date="2019-10-10" href="#" onclick="filterEvents('date', this.dataset.date); return false;">10 OKT 2019</a>
          <a class="button_rect_yellow" data-date="2019-10-11" href="#" onclick="filterEvents('date', this.dataset.date); return false;">11 OKT 2019</a>
          <a class="button_rect_yellow" data-date="2019-10-12" href="#" onclick="filterEvents('date', this.dataset.date); return false;">12 OKT 2019</a>
          <a class="button_rect_yellow" data-date="2019-10-13" href="#" onclick="filterEvents('date', this.dataset.date); return false;">13 OKT 2019</a>
        </div>
      </span> &nbsp;&nbsp;

      <span class="hover_menu_trigger">
        <a class="button_rect_pink" data-filter="category" href="/">Kategorie</a>
        <div class="hover_menu">
          <a class="button_rect_yellow" data-category="Film-Kunst-Musik" href="#" onclick="filterEvents('category', this.dataset.category); return false;">Film-Kunst-Musik</a>
          <a class="button_rect_yellow" data-category="Stadt-Praxis" href="#" onclick="filterEvents('category', this.dataset.category); return false;">Stadt-Praxis</a>
          <a class="button_rect_yellow" data-category="Vortrag/Diskussion" href="#" onclick="filterEvents('category', this.dataset.category); return false;">Vortrag/Diskussion</a>
          <a class="button_rect_yellow" data-category="Workshop" href="#" onclick="filterEvents('category', this.dataset.category); return false;">Workshop</a>
        </div>
      </span> &nbsp;&nbsp;

      <span class="hover_menu_trigger">
        <a class="button_rect_pink" data-filter="query" href="/">Volltextsuche</a>
        <div class="hover_menu">
          <input type="search">
          <a class="button_rect_pink" href="/search-todo/">Suchen</a>
        </div>
      </span>

      <br><br>

      ${eventListing(Object.values(urbanize.events))}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: 'Programm' });
};
