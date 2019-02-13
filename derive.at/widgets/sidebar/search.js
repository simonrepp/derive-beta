module.exports = `
  <form action="/suche/" class="sidebar__searchform">
    <input name="query" placeholder="Suche" type="search">

    <div>
      Zeitschrift <span class="icon-checkbox-checked" data-section="issues"></span>
    </div>

    <div>
      Autoren <span class="icon-checkbox-checked" data-section="authors"></span>
    </div>

    <div>
      Bücher <span class="icon-checkbox-checked" data-section="books"></span>
    </div>

    <div>
      Radio <span class="icon-checkbox-checked" data-section="programs"></span>
    </div>

    <div>
      Texte <span class="icon-checkbox-checked" data-section="articles"></span>
    </div>

    <button>
      Suche starten
    </button>
  </form>
`;
