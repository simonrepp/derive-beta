const moment = require('moment');

const authors = require('../widgets/authors.js'),
      layout = require('../layout.js'),
      programTile = require('../widgets/program-tile.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = data => {
  const sortedPrograms = Array.from(data.programs.values()).sort((a, b) => b.date - a.date)
  const latest = sortedPrograms[0];

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${latest.image ? `
          <img src="${latest.image.written}" />
          Cover-Design: TODO Elke Rauth
        `:''}
      </div>

      <div class="feature__text">
        <h1>dérive–Radio für Stadtforschung</h1>

        Jeden 1. Dienstag im Monat um 17.30 Uhr auf Radio Orange FM 94.0 oder Livestream <a href="http://o94.at">http://o94.at</a><br/><br/>

        Sendungsarchiv zum Nachhören: <a href="http://cba.fro.at/series/1235">http://cba.fro.at/series/1235</a><br/><br/>

        <div class="generic__margin-vertical">
          <strong>Redaktion</strong>
          ${authors(latest.authors)}
        </div>

        ${tags(latest.tags.connected)}

        <hr class="hr__light" />

        ${share(latest.title, `/radio/${latest.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      <span class="icon-previous"></span> 1 / 190 TODO <span class="icon-next"></span>
    </div>

    <div class="tiles">
      ${sortedPrograms.map(programTile).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Radio', title: 'Radio' });
};
