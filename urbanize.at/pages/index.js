const moment = require('moment');

moment.updateLocale('de', {
  monthsShort : [
    'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
  ]
});

const { featureSort } = require('../../derive-common/util.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');
const timeframe = require('../widgets/timeframe.js');

const feature = feature => feature.event ? `
<div class="feature margin_y_2_0">
  <div>
    ${feature.event.image ? `
      <img src="${feature.event.image.written}">
    `:''}
    ${feature.event.imageCredits ? `
      <div class="color_grey font_size_0_8 text_align_right">${feature.event.imageCredits}</div>
    `:''}
  </div>

  <div class="event_details margin_y_0_5">
    <a class="button_rect_black event_category_tag" href="/programm/?kategorie=${feature.event.category}">
      ${feature.event.category}
    </a>

    <strong class="color_pink">${moment(feature.event.dates[0].date).locale('de').format('dd, D MMM YYYY')}</strong><br>
    <strong class="color_pink">${timeframe(feature.event.dates[0])}</strong>
  </div>

  <hr class="hairline">

  <h2 class="margin_y_0">
    <a href="/${feature.event.permalink}/">
      ${feature.event.title}
    </a>
  </h2>

  <hr class="hairline">

  <strong>${feature.event.venue}</strong><br>
  <strong>
    ${feature.event.mapLink ? `<a href="${feature.event.mapLink}" target="_blank">${feature.event.address}</a>` : feature.event.address}
  </strong>

  <hr>
</div>
` : `
  <div class="feature margin_y_2_0">
    <img src="${feature.image.written}">
    ${feature.imageCredits ? `
      <div class="color_grey font_size_0_8 text_align_right">${feature.imageCredits}</div>
    ` : ''}
    <hr class="hairline">
    <h1><a href="${feature.link}">${feature.title}</a></h1>
    <hr class="hairline">

    ${feature.text.converted}

    <hr>
  </div>
`;

module.exports = urbanize => {
  // const sortedFeatures = urbanize.features.sort(featureSort);

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
