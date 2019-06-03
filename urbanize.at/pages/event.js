const striptags = require('striptags');

const addThis = require('../widgets/add-this.js');
const layout = require('./layout.js');
const participants = require('../widgets/participants.js');
const timeframe = require('../widgets/timeframe.js');

module.exports = (urbanize, event) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${event.title}
      </div>

      ${event.subtitle ? `
        <strong class="generic__subheading generic__heading_addendum">
          ${event.subtitle}
        </strong>
      `:''}

      <div class="additional">
        ${timeframe(event)}<br>
        ${event.address}
      </div>

      <div class="additional">
        ${event.additionalInfo ? event.additionalInfo.converted : ''}
      </div>

      ${event.abstract ? `
        <div class="generic__serif">
          ${event.abstract.converted}
        </div>
      `:''}


      ${event.text ? `
        <hr>

        <div class="generic__serif">
           ${event.text.written}
        </div>
      `:''}

      <hr>

      ${participants(event.participants)}
      Kategorie: ${event.category}

      ${addThis(`${urbanize.base_url}/veranstaltungen/${event.permalink}/`)}
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
