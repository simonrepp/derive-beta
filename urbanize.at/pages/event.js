const moment = require('moment');
const striptags = require('striptags');

moment.updateLocale('de', {
  monthsShort : [
    'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
  ]
});

const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');
const signupButton = require('../widgets/signup_button.js');

module.exports = (urbanize, event) => {
  const html = `
    <div>
      <div class="margin_y_2_0">
        ${event.image ? `
          <img src="${event.image.written}">
        `:''}
        ${event.imageCredits ? `
          <div class="color_grey font_size_0_8 text_align_right">${event.imageCredits}</div>
        `:''}
      </div>

      ${event.dates.map(date => `
        <div class="flex_split_lr margin_y_0_5">
          <div>
            <strong class="color_pink">${moment(date.date).locale('de').format('dd, D MMM YYYY')}</strong><br>
            <strong class="color_pink">${date.time.raw}</strong>
          </div>

          <div>
            ${signupButton(event, date)}
          </div>
        </div>

        <hr class="hairline">
      `).join('')}

      <strong>${event.venue}</strong><br>
      <strong>
        ${event.mapLink ? `<a href="${event.mapLink}" target="_blank">${event.address}</a>` : event.address}
      </strong>

      ${event.directions ? `
        <div class="margin_y_0_5">
          ${event.directions.converted}
        </div>
      ` : ''}

      <hr class="hairline">

      <h2>
        <a href="/${event.permalink}/">
          ${event.title}
        </a>
      </h2>

      <div class="margin_y_0_5">
        <strong>${event.subtitle}</strong>
      </div>

      ${event.text ? `
        <div class="margin_y_0_5">
          ${event.text.written}
        </div>
      ` : ''}

      ${event.participants.length > 0 ? `
        <div class="margin_y_0_5">
          <strong>
            Mit
            <a href="/${event.participants[0].permalink}/" target="_blank">
              ${event.participants[0].name}
            </a>

            ${event.participants >= 3 ? event.participants.slice(1, event.participants.length - 1).map(participant => `
              ,
              <a href="/${participant.permalink}/" target="_blank">
                ${participant.name}
              </a>
            `).join('') : ''}

            ${event.participants >= 2 ? `
              und
              <a href="/${event.participants[event.participants.length - 1].permalink}/" target="_blank">
                ${event.participants[event.participants.length - 1].name}
              </a>
            ` : ''}
          </strong>
        </div>
      ` : ''}

      <hr class="hairline">

      ${event.links.length > 0 ? `
        <div class="margin_y_0_5">
          <strong>Links</strong><br>
          ${event.links.map(link => `
              <a href="${link}">${link}</a><br>
          `).join('')}
        </div>
      ` : ''}

      <hr>

      ${scrollToTop}
    </div>
  `;

  const og = {};

  if(event.image) {
    og.image = urbanize.base_url + event.image.written;
    og.imageWidth = event.image.width;
    og.imageHeight = event.image.height;
  } else if(event.text && event.text.embeds && event.text.embeds.length > 0) {
    og.image = urbanize.base_url + event.text.embeds[0].written;
    og.imageWidth = event.text.embeds[0].width;
    og.imageHeight = event.text.embeds[0].height;
  }

  return layout(html, urbanize, { description: event.abstract ? striptags(event.abstract.converted) : undefined, og: og, title: event.title });
};
