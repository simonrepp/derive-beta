const striptags = require('striptags');

const layout = require('./layout.js');
const participants = require('../widgets/participants.js');
const scrollToTop = require('../widgets/scroll_to_top.js');
const timeframe = require('../widgets/timeframe.js');

module.exports = (urbanize, event) => {
  const html = `
    <div>
      <strong class="color_pink">Mi, 9 OKT 2019</strong><br>
      <strong class="color_pink">19:00</strong>
      == ${timeframe(event)}

      <hr class="hairline">

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

      <div class="margin_y_0_5">
        <a class="button_rect_pink" href="">
          Anmeldung
        </a>
      </div>

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
