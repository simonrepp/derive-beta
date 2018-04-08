module.exports = `
  <form action="/suche/" class="sidebar__searchform" method="GET">
    <input name="bereiche" type="hidden" value="" />

    <input name="begriff" placeholder="Suche" type="search" />

    <div>
      Zeitschrift <span class="icon-checkbox-checked" data-include-section="zeitschrift"/>
    </div>

    <div>
      Autoren <span class="icon-checkbox-checked" data-include-section="autoren"/>
    </div>

    <div>
      Bücher <span class="icon-checkbox-checked" data-include-section="bücher"/>
    </div>

    <div>
      Radio <span class="icon-checkbox-checked" data-include-section="radio"/>
    </div>

    <div>
      Texte <span class="icon-checkbox-checked" data-include-section="texte"/>
    </div>

    <button>
      Suche starten
    </button>
  </form>
`;
