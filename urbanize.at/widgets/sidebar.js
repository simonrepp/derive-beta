const moment = require('moment');

module.exports = urbanize => `
  <div class="sidebar offset">
    <form action="/suche/" class="search">
      <input name="begriff" placeholder="Suche" type="text">&nbsp;
      <button>Go</button>
    </form>

    <p>Programm</p>

    <div class="indented">
      <div>
        <a href="/veranstaltungen/">
          Alle Tage
        </a>
      </div>

      ${Array.from(urbanize.eventsByDate.keys()).sort().map(date => `
        <div>
          <a href="/${moment(date).locale('de').format('D-MMMM-YYYY')}/">
            ${moment(date).locale('de').format('ddd, D. M. YYYY')}
          </a>
        </div>
      `).join('')}
    </div>

    <p>Kategorien</p>

    <div class="indented">
      ${Array.from(urbanize.categories.values()).map(category => `
        <div>
          <a href="/kategorien/${category.permalink}/">
            ${category.name}
          </a>
        </div>
      `).join('')}
    </div>

    <p>Festival</p>

    <div class="indented">
      <div>
        <a href="/">
          Startseite
        </a>
      </div>
      <div>
        <a href="/about/">
          About
        </a>
      </div>
      <div>
        <a href="/festivalorte/">
          Festivalorte
        </a>
      </div>
      <div>
        <a href="/beteiligte/">
          Beteiligte
        </a>
      </div>
      <div>
        <a href="/festivalpartnerinnen/">
          FestivalpartnerInnen
        </a>
      </div>
      <div>
        <a href="/presse/">
          Presse
        </a>
      </div>
      <div>
        <a href="/kontakt/">
          Kontakt
        </a>
      </div>
    </div>

    <p>dérive – Stadtforschung</p>

    <div class="indented">
      <div><a href="http://derive.at" target="_blank">Website</a></div> ${''/* TODO: https link as soon as we migrated */}
      <div><a href="/radio/">Radio</a></div>
      <div><a href="/zeitschrift/">Zeitschrift</a></div>
      <div><a href="/verein/">Verein</a></div>
      <div><a href="/impressum/">Impressum</a></div>
      <div>
        <a href="http://derive.us2.list-manage1.com/subscribe?u=a173854ec3f34090566a9475c&amp;id=99617a522a" target="_blank">
          Newsletter
        </a>
      </div>
    </div>

    <p>Vorherige Festivals</p>

    <div class="indented">
      <div><a href="https://2017.urbanize.at">ur8anize! 2017</a></div>
      <div><a href="https://2016.urbanize.at">urbani7e! 2016</a></div>
      <div><a href="https://2015.urbanize.at">ur6anize! 2015</a></div>
      <div><a href="https://2014.urbanize.at">ur5anize! 2014</a></div>
      <div><a href="https://2013.urbanize.at">ur4anize! 2013</a></div>
      <div><a href="https://2012.urbanize.at">ur3anize! 2012</a></div>
      <div><a href="http://2011.urbanize.at">urbani2e! 2011</a></div>
    </div>
  </div>
`;
