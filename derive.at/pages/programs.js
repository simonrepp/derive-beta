const moment = require('moment');

const editors = require('../widgets/editors.js'),
      layout = require('./layout.js'),
      programTile = require('../widgets/program-tile.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, pagination) => {
  const firstWithImage = pagination.programs.find(program => program.image);

  const html = `
    <div class="feature">

      <div class="feature__image">
        ${firstWithImage ? `<img src="${firstWithImage.image.written}" />` : ''}
      </div>

      <div class="feature__text">
        <h1>${data.radio.title}</h1>

        <div class="generic__margin-vertical">
          ${data.radio.info.sourced}
        </div>

        ${editors(data.radio.editors.connected)}

        <hr class="hr__light" />

        ${share(data.radio.title, '/radio/')}
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

  return layout(data, html, { activeSection: 'Radio', title: data.radio.title });
};
