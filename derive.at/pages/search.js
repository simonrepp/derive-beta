const layout = require('./layout.js');

module.exports = data => {
  const html = `
    <div>
      <div class="pagination TODO-dontusepaginationbutgenericthing">
        <form action="/suche/" class="search__searchform">
          <div>
            <input name="query" placeholder="Ihr Suchbegriff" type="search">

            <button type="button" data-toggle-filters>
              Filter
            </button>
            <button type="submit">
              Suchen
            </button>
          </div>

          <div class="search__filters">
            <div class="search__filter"><span class="icon-checkbox-checked" data-section="issues"></span> Zeitschrift</div>
            <div class="search__filter"><span class="icon-checkbox-checked" data-section="authors"></span> Autoren</div>
            <div class="search__filter"><span class="icon-checkbox-checked" data-section="books"></span> Bücher</div>
            <div class="search__filter"><span class="icon-checkbox-checked" data-section="programs"></span> Radio</div>
            <div class="search__filter"><span class="icon-checkbox-checked" data-section="articles"></span> Texte</div>
          </div>
        </form>
      </div>

      <div class="search__info">
        Suchergebnisse für:<br>
        <h2 class="search__query"></h2>
      </div>

      <div class="search__results tiles">
        Suche läuft ...
      </div>
    </div>
  `;

  return layout(data, html, { title: 'Suche' });
};
