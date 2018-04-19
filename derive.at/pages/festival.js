const layout = require('./layout.js'),
      share = require('../widgets/share.js');

module.exports = data => {
  const html = `
    <div class="feature">

      <div class="feature__image">
        <img src="${data.festival.editions[0].image.written}"/>
      </div>

      <div class="feature__text">
        <h1>${data.festival.title}</h1>
        <h2>${data.festival.subtitle}</h2>

        <span>
          ${data.festival.description.converted}
        </span>

        <div class="generic__margin-vertical">
          <a href="https://urbanize.at">urbanize.at</a>
        </div>

        ${share(data.festival.title, 'https://derive.at/festival/')}
      </div>
    </div>

    <h2 class="generic__center-aligned">
      Festivals der letzten Jahre
    </h2>

    <div class="tiles">
      ${data.festival.editions.map(edition => `
        <div class="tile tile--festival">
          <a href="${edition.url}" target="_blank">
            <img src="${edition.image.written}" />
          </a>
        </div>
      `).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Festival', title: `${data.festival.title} ${data.festival.subtitle}` });
};
