const moment = require('moment');

moment.updateLocale('de', {
  monthsShort : [
    'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
  ]
});

const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');
const timeframe = require('../widgets/timeframe.js');

const eventFeature = event => `
  <div class="feature">
    <div>
      ${event.image ? `
        <img src="${event.image.written}">
      `:''}
      ${event.imageCredits ? `
        <div class="color_grey font_size_0_8 text_align_right">${event.imageCredits}</div>
      `:''}
    </div>

    <div class="extra_indent">
      <div class="event_details margin_y_0_5">
        <a class="button_rect_black event_category_tag" href="/programm/?kategorie=${event.category}">
          ${event.category}
        </a>

        <strong class="color_accent">${moment(event.dates[0].date).locale('de').format('dd, D MMM YYYY')}</strong><br>
        <strong class="color_accent">${timeframe(event.dates[0])}</strong>
      </div>

      <hr class="hairline">

      <h2 class="margin_y_0">
        <a href="/${event.permalink}/">
          ${event.title}
        </a>
      </h2>

      <hr class="hairline">

      <strong>${event.venue}</strong><br>
      <strong>
        ${event.mapLink ? `<a href="${event.mapLink}" target="_blank">${event.address}</a>` : event.address}
      </strong>
    </div>

    <hr>
  </div>
`;

const customFeature = feature => `
  <div class="feature">
    <img src="${feature.image.written}">
    ${feature.imageCredits ? `
      <div class="color_grey font_size_0_8 text_align_right">${feature.imageCredits}</div>
    ` : ''}

    <div class="extra_indent">
      <hr class="hairline">
      <h2 class="margin_y_0">
        <a href="${feature.link}">${feature.title}</a>
      </h2>
      <hr class="hairline">

      ${feature.text.converted}
    </div>

    <hr>
  </div>
`;

const feature = feature => feature.event ? eventFeature(feature.event) : customFeature(feature);

module.exports = urbanize => {
  const html = `
    <div class="features alignment_desktop">
      <div>${urbanize.home.features.filter((_, index) => index % 2 === 0).map(feature).join('')}</div>
      <div>${urbanize.home.features.filter((_, index) => index % 2 === 1).map(feature).join('')}</div>
    </div>

    <div class="features alignment_mobile">
      ${urbanize.home.features.map(feature).join('')}
    </div>

    ${scrollToTop}
  `;

  return layout(html, urbanize, { banner: 'large', title: urbanize.title });
};
