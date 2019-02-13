const layout = require('./layout.js');
const panel = require('../widgets/cinema/panel.js');
const share = require('../widgets/share.js');

module.exports = data => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        <img src="${data.cinema.image.written}">
      </div>

      <div class="generic__featured_text">
        <h1>${data.cinema.title}</h1>
        <h2>${data.cinema.subtitle}</h2>

        <span class="generic__serif">
          ${data.cinema.description.converted}
        </span>

        <div class="generic__margin_vertical">
          <a href="${data.cinema.externalLink}">Stadt Streifen auf filmcasino.at</a>
        </div>

        ${share(data.cinema.title, 'https://derive.at/stadt-streifen/')}
      </div>
    </div>

    <div>
      ${data.cinema.dates.map(panel).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Kino', title: `${data.cinema.title} ${data.cinema.subtitle}` });
};
