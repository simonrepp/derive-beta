const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  const html = `
    <div>
      <h2>
        Filtern nach
      </h2>

      <div class="filter_alignment">
        <span class="hover_menu_trigger">
          <a class="button_rect_pink" data-filter="date" href="#" onclick="return false;">Datum<span class="active_date"></span></a>
          <div class="hover_menu">
            <a class="button_rect_yellow" data-date="all" href="#" onclick="updateFilter(this); return false;">Alle Tage</a>
            <a class="button_rect_yellow" data-date="2019-10-09" href="#" onclick="updateFilter(this); return false;">9 OKT 2019</a>
            <a class="button_rect_yellow" data-date="2019-10-10" href="#" onclick="updateFilter(this); return false;">10 OKT 2019</a>
            <a class="button_rect_yellow" data-date="2019-10-11" href="#" onclick="updateFilter(this); return false;">11 OKT 2019</a>
            <a class="button_rect_yellow" data-date="2019-10-12" href="#" onclick="updateFilter(this); return false;">12 OKT 2019</a>
            <a class="button_rect_yellow" data-date="2019-10-13" href="#" onclick="updateFilter(this); return false;">13 OKT 2019</a>
          </div>
        </span>

        <span class="hover_menu_trigger">
          <a class="button_rect_pink" data-filter="category" href="#" onclick="return false;">Kategorie<span class="active_category"></span></a>
          <div class="hover_menu">
            <a class="button_rect_yellow" data-category="all" href="#" onclick="updateFilter(this); return false;">Alle Kategorien</a>
            <a class="button_rect_yellow" data-category="Film-Kunst-Musik" href="#" onclick="updateFilter(this); return false;">Film-Kunst-Musik</a>
            <a class="button_rect_yellow" data-category="Stadt-Praxis" href="#" onclick="updateFilter(this); return false;">Stadt-Praxis</a>
            <a class="button_rect_yellow" data-category="Vortrag/Diskussion" href="#" onclick="updateFilter(this); return false;">Vortrag/Diskussion</a>
            <a class="button_rect_yellow" data-category="Workshop" href="#" onclick="updateFilter(this); return false;">Workshop</a>
          </div>
        </span>

        <!-- span class="hover_menu_trigger">
          <a class="button_rect_pink" data-filter="query" href="/">Volltextsuche</a>
          <div class="hover_menu">
            <input type="search">
            <a class="button_rect_pink" href="/search-todo/">Suchen</a>
          </div>
        </span -->
      </div>

      <br><br>

      ${eventListing(Object.values(urbanize.events))}

      <div class="no_results" style="display: none;">
        <em>Keine Veranstaltungen entsprechen den aktuellen Filterkriterien</em>
      </div>

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: 'Programm' });
};
