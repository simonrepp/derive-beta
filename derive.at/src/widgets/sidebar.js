const navigationWidget = `
  <a href="/">Startseite</a><br/><br/>

  <a href="/zeitschrift/">Zeitschrift</a><br/>
  <a href="/texte/">Texte</a><br/>
  <a href="/radio/">Radio</a><br/>
  <a href="/festival/">Festival</a><br/>
  <a href="/bücher/">Bücher</a><br/>
  <a href="/autoren/">Autoren</a><br/>
  <a href="/kiosk/">Kiosk</a><br/>
  <a href="/über-derive/">Über dérive</a><br/>
  <a href="/impressum/">Kontakt / Impressum</a><br/>
`;

const searchWidget = `
  <form action="/suche/" class="sidebar__searchform" method="GET">
    <input name="bereiche" type="hidden" value=""/>

    <input name="begriff" placeholder="Suche" type="search"/>

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

module.exports = `
  <div class="sidebar">
    <div class="sidebar__item">
      <a class="sidebar__link">
        <span class="icon-menu"></span>
      </a>

      <div class="sidebar__widget">
        ${navigationWidget}
      </div>
    </div>

    <div class="sidebar__item">
      <a class="sidebar__link">
        <span class="icon-search"></span>
      </a>

      <div class="sidebar__widget">
        ${searchWidget}
      </div>
    </div>

    <a class="sidebar__link"
       href="https://derive.tictail.com/"
       target="_blank" >
      <span class="icon-kiosk"></span>
    </a>

    <a class="sidebar__link"
       href="http://eepurl.com/fmHIo">
      <span class="icon-mail"></span>
    </a>

    <div class="sidebar__item">
      <a class="sidebar__link">
        <span class="icon-tags"></span>
      </a>

      <div class="sidebar__widget">
        <strong>Tags</strong><br/><br/>

        Refugeeswelcome, Bildung, Film, Flucht und Asyl, Gentrifizierung, Kooperation, Kunst, London, Raumproduktion, urbanize! Festival, Widerstand, Wien

        This nav menu is currently not in use. It is intended to be used later, when things like user login with personal settings are integrated. The idea would be that each user could save his favourite tags, which would dynamically show up as soon as the user is logged in.
      </div>
    </div>

    <div class="sidebar__item">
      <a class="sidebar__link">
        <span class="icon-bookmark"></span>
      </a>

      <div class="sidebar__widget">
        <strong>Ähnliche Inhalte</strong><br/><br/>

        This bookmark nav menu is intended to show links to content that is thematically related to what is shown on the screen... (probably not in use yet) 
      </div>
    </div>

    <a class="sidebar__link sidebar__link__edition">
      <span>
        <span class="">N<sup>o</sup></span><br/>
        62
      </span>
    </a>

    <a class="sidebar__link sidebar__link__top">
      <span class="icon-top"></span>
    </a>
  </div>
`;