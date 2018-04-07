const moment = require('moment');

const editors = require('../widgets/editors.js'),
      layout = require('./layout.js'),
      programTile = require('../widgets/program-tile.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, pagination) => {
  const first = pagination.programs[0];

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${first.image ? `<img src="${first.image.written}" />` : ''}
      </div>

      <div class="feature__text">
        <h1>dérive–Radio für Stadtforschung</h1>

        Jeden 1. Dienstag im Monat um 17.30 Uhr auf Radio Orange FM 94.0 oder Livestream <a href="http://o94.at">http://o94.at</a><br/><br/>

        Sendungsarchiv zum Nachhören: <a href="http://cba.fro.at/series/1235">http://cba.fro.at/series/1235</a><br/><br/>

        <!-- TODO: "Allgemeine" Redaktion sollten wohl als globale Konfiguration vorliegen -->
        ${editors(first.editors.connected)}

        <!-- TODO "Allgemeine" Tags? Von allen Radiosendungen ist wohl zuviel ... Also globale Konfiguration, oder weg. -->
        ${tags(first.tags.connected)}

        <hr class="hr__light" />

        ${share(first.title, `/radio/${first.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      ${data.programsPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/radio/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div class="tiles">
      ${pagination.programs.map(programTile).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Radio', title: 'Radio' });
};
