module.exports = data => `
  <div class="sidebar">
    <div class="sidebar__item">
      <a class="sidebar__link sidebar__widget-toggle">
        <span class="icon-menu"></span>
      </a>

      <div class="sidebar__widget">
          <a href="/">Startseite</a><br><br>

          <a href="/zeitschrift/">Zeitschrift</a><br>
          <a href="/texte/">Texte</a><br>
          <a href="/radio/">Radio</a><br>
          <a href="/kino/">Kino</a><br>
          <a href="/festival/">Festival</a><br>
          <a href="/buecher/">Bücher</a><br>
          <a href="/autoren/">Autoren</a><br>
          <a href="https://shop.derive.at" target="_blank">Shop</a><br>
          <a href="/ueber-derive/">Über dérive</a><br>
          <a href="/impressum/">Kontakt / Impressum</a><br>
      </div>
    </div>

    <div class="sidebar__item">
      <a class="sidebar__link sidebar__link__search sidebar__widget-toggle">
        <span class="icon-search"></span>
      </a>

      <div class="sidebar__widget">
          <form action="/suche/" class="sidebar__searchform">
            <input name="query" placeholder="Suche" type="search">

            <div>
              Zeitschrift <span class="icon-checkbox-checked" data-section="zeitschrift"></span>
            </div>

            <div>
              Autoren <span class="icon-checkbox-checked" data-section="autoren"></span>
            </div>

            <div>
              Bücher <span class="icon-checkbox-checked" data-section="bücher"></span>
            </div>

            <div>
              Radio <span class="icon-checkbox-checked" data-section="radio"></span>
            </div>

            <div>
              Texte <span class="icon-checkbox-checked" data-section="texte"></span>
            </div>

            <button>
              Suche starten
            </button>
          </form>
      </div>
    </div>

    <a class="sidebar__link"
       href="https://shop.derive.at"
       target="_blank" >
      <span class="icon-kiosk"></span>
    </a>

    <a class="sidebar__link"
       href="/newsletter/" >
      <span class="icon-mail"></span>
    </a>

    <a class="sidebar__link sidebar__link__edition"
       href="/zeitschrift/${data.issuesDescending[0].number}">
      N°<br>
      ${data.issuesDescending[0].number}
    </a>

    <a class="sidebar__link sidebar__link__top">
      <span class="icon-top"></span>
    </a>
  </div>
`;
