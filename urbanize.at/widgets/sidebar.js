const moment = require('moment');

module.exports = urbanize => `
  <div class="sidebar">

    <p>SUCHE</p>

    <form class="search"
          onsubmit"event.preventDefault(); const query = event.target.search.value; navigateTo('/search/' + query);" >
      <input type="search" name="search" />
      <button>Go</button>
    </form>

    <p>MENÜ</p>

    <a href="/">
      Start
    </a>

    <a href="/veranstaltungen/">
      Programm
    </a>

    <div class="indented">
      ${Array.from(urbanize.eventsByDate.keys()).map(date => `
        <div>
          <a href="/${date}/">
            ${moment(date).format('D.MM.YYYY')}
          </a>
        </div>
      `).join('')}
    </div>

    <p>KATEGORIEN</p>

    ${Object.keys(urbanize.categories).map(category => `
      <div>
        <a href="/kategorien/${category}/">
          ${category}
        </a>
      </div>
    `).join('')}

    <p></p>

    <a href="/seiten/about/">
      About
    </a>
    <a href="/seiten/festivalzentrale/">
      Festivalzentrale
    </a>
    <a href="/teilnehmerinnen/">
      TeilnehmerInnen
    </a>
    <a href="/seiten/partners/">
      FestivalpartnerInnen
    </a>
    <a href="/seiten/presse/">
      Presse
    </a>
    <a href="/seiten/kontakt/">
      Kontakt
    </a>

    <p></p>

    <a href="/seiten/about-radio/">dérive - Radio</a>
    <a href="/seiten/about-magazine/">dérive - Zeitschrift</a>
    <a href="/seiten/verein/">dérive - Verein</a>
    <a href="/seiten/impressum/">Impressum</a>

    <p></p>

    <a href="http://derive.us2.list-manage1.com/subscribe?u=a173854ec3f34090566a9475c&amp;id=99617a522a">
      Anmelden für Newsletter
    </a>

    <a href="https://derive.at">dérive – Verein für Stadtforschung</a>
    <a href="https://2016.urbanize.at">urbani7e! 2016</a>
    <a href="https://2015.urbanize.at">ur6anize! 2015</a>
    <a href="https://2014.urbanize.at">ur5anize! 2014</a>
    <a href="https://2013.urbanize.at">ur4anize! 2013</a>
    <a href="https://2012.urbanize.at">ur3anize! 2012</a>
    <a href="http://2011.urbanize.at">urbani2e! 2011</a>
  </div>
`;
