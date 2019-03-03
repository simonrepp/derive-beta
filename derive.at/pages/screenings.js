const moment = require('moment');

const layout = require('./layout.js');
const panel = require('../widgets/screenings/panel.js');
const share = require('../widgets/share.js');

module.exports = data => {
  const screenings = Array.from(data.screenings.values());

  screenings.sort((a,b) => b.date - a.date);

  const featured = screenings.slice().reverse().find(screening => screening.date > new Date) || screenings[0];

  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        <img src="${featured.image.written}">
      </div>

      <div class="generic__featured_text">
        <h1><a href="/kino/${featured.permalink}/">${featured.title}</a></h1>
        <h2>${moment(featured.date).format('D.M.YYYY')} ${featured.time}</h2>

        <span class="generic__serif">
          ${featured.abstract.converted}
        </span>

        <div class="generic__margin_vertical">
          <a href="/ueber-radio-derive/">Über Cinema dérive</a>
        </div>

        ${share(featured.title, `https://derive.at/kino/${featured.permalink}/`)}
      </div>
    </div>

    <div>
      ${screenings.map(panel).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Kino', title: 'Cinema dérive' });
};
