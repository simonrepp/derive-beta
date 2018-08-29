const moment = require('moment');

const editors = require('../widgets/editors.js'),
      layout = require('./layout.js'),
      programTile = require('../widgets/program-tile.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, pagination) => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        <img src="${data.radio.image.written}" />
      </div>

      <div class="generic__featured_text">
        <h1>${data.radio.title}</h1>

        <div class="generic__margin_vertical">
          ${data.radio.info.converted}
        </div>

        ${editors(data.radio.editors)}

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
