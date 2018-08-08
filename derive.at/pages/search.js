const layout = require('./layout.js');

module.exports = data => {
  const html = `
    <div>
      <div class="pagination TODO-dontusepaginationbutgenericthing">
        <form action="/suche/">
          <span class="icon-search"></span>

          <input name="begriff" placeholder="Ihr Suchbegriff" type="search" />

          <div>
            Zeitschrift <span class="icon-checkbox-checked" data-section="issues"/>
          </div>

          <div>
            Autoren <span class="icon-checkbox-checked" data-section="authors"/>
          </div>

          <div>
            Bücher <span class="icon-checkbox-checked" data-section="books"/>
          </div>

          <div>
            Radio <span class="icon-checkbox-checked" data-section="programs"/>
          </div>

          <div>
            Texte <span class="icon-checkbox-checked" data-section="articles"/>
          </div>

          <!-- TODO: Restore up there ^^^^^^^ the correct checkbox state based on global search.sections data on turbolinks:render -->

          <button>
            Suche starten
          </button>
        </form>
      </div>

      <div class="search__info">
        Suchergebnisse für:<br/>
        <h2 class="search__query"></h2>
      </div>

      <div class="search__results tiles">
        Suche läuft ...
      </div>
    </div>
  `;

  return layout(data, html, { title: 'Suche' });
};
