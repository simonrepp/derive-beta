const moment = require('moment');

const layout = require('./layout.js');
const share = require('../widgets/share.js');

module.exports = (data, screening) => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        <img src="${screening.image.written}">
      </div>

      <div class="generic__featured_text">
        <h1>${screening.title}</h1>
        <h2>${moment(screening.date).format('D.M.YYYY')} ${screening.time}</h2>

        <div class="generic__margin_vertical">
          <a href="${screening.link}">Tickets</a>
        </div>

        ${screening.filmMeta}
        ${screening.eventMeta.converted}

        <span class="generic__serif">
          ${screening.text.converted}
        </span>

        ${share(screening.title, `https://derive.at/kino/${screening.permalink}/`)}
      </div>
    </div>
  `;

  return layout(data, html, { activeSection: 'Kino', title: screening.title });
};
