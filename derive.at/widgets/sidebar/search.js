module.exports = `
  <form action="/suche/" class="sidebar__searchform">
    <input name="query" placeholder="Suche" type="search" />

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

    <button>
      Suche starten
    </button>
  </form>
`;
