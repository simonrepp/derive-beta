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
          Programm
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
      <div>
        <a href="/kategorien/vortrag-or-diskussion/">
          Vortrag | Diskussion
        </a>
      </div>
      <div>
        <a href="/kategorien/workshop/">
          Workshop
        </a>
      </div>
      <div>
        <a href="/kategorien/stadt-praxis/">
          Stadt-Praxis
        </a>
      </div>
      <div>
        <a href="/kategorien/film-kunst-musik/">
          Film-Kunst-Musik
        </a>
      </div>
    </div>

    <p>Festival</p>

    <div class="indented">
      <div>
        <a href="/">
          Home
        </a>
      </div>
      <div>
        <a href="/about/">
          About
        </a>
      </div>
      <div>
        <a href="/orte/">
          Orte
        </a>
      </div>
      <div>
        <a href="/beteiligte/">
          Beteiligte
        </a>
      </div>
      <div>
        <a href="/partnerinnen/">
          Partner*innen
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
      <div><a href="https://derive.at" target="_blank">Website</a></div>
      <div><a href="/zeitschrift/">Zeitschrift</a></div>
      <div><a href="/radio/">Radio</a></div>
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
