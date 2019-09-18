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
        function filter() {
          const activeDate = document.querySelector('.active_date');
          const activeCategory = document.querySelector('.active_category');

          for(const event of document.querySelectorAll('.event_filterable')) {
            let display = true;

            if(activeDate.dataset.value &&
               activeDate.dataset.value !== 'all' &&
               event.dataset.date !== activeDate.dataset.value) {
              display = false;
            }

            if(activeCategory.dataset.value &&
               activeCategory.dataset.value !== 'all' &&
               event.dataset.category !== activeCategory.dataset.value) {
              display = false;
            }

            event.style.display = display ? 'block' : 'none';
          }
        }

        function updateFilter(option) {
          if(option.dataset.date) {
            const activeDate = document.querySelector('.active_date');

            activeDate.dataset.value = option.dataset.date;

            if(option.dataset.date === 'all') {
              activeDate.innerHTML = '';
            } else {
              activeDate.innerHTML = ': ' + option.innerHTML;
            }
          }

          if(option.dataset.category) {
            const activeCategory = document.querySelector('.active_category');

            activeCategory.dataset.value = option.dataset.category;

            if(option.dataset.category === 'all') {
              activeCategory.innerHTML = '';
            } else {
              activeCategory.innerHTML = ': ' + option.innerHTML;
            }
          }

          filter();
        }
      </script>

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

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: 'Programm' });
};
