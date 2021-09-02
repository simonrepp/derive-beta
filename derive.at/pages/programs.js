const moment = require('moment');

const editors = require('../widgets/editors.js');
const layout = require('./layout.js');
const programTile = require('../widgets/program-tile.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');

const { stripAndTruncateHtml } = require('../../derive-common/util.js');

module.exports = (data, pagination) => {
  const { featured, programs } = pagination;

  const html = `
    <div class="generic__featured">
      <div class="generic__featured_image">
        <img src="${featured.image.written}">
      </div>

      <div class="generic__featured_text">
        <h1><a href="/radio/${featured.permalink}/">${featured.title}</a></h1>

        <div class="generic__margin_vertical">
          ${featured.abstract ? featured.abstract.converted : (featured.text ? stripAndTruncateHtml(featured.text.converted, 500, `/radio/${featured.permalink}/`) : 'Kein Text vorhanden.')}
        </div>

        ${editors(featured.editors)}

        <div class="generic__margin_vertical">
          <a href="/ueber-radio-derive/">Über Radio dérive</a>
        </div>

        ${share(featured.title, `https://derive.at/radio/${featured.permalink}/`)}
      </div>
    </div>

    <div class="pagination">
      ${data.programsPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/radio/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div class="tiles">
      ${programs.map(programTile).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Radio', title: 'Radio dérive' });
};
