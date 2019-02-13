const striptags = require('striptags');

const addThis = require('../widgets/add-this.js');
const categories = require('../widgets/categories.js');
const hosts = require('../widgets/hosts.js');
const participants = require('../widgets/participants.js');
const tags = require('../widgets/tags.js');
const timeframe = require('../widgets/timeframe.js');

module.exports = (urbanize, event) => {
  let involved;
  if(urbanize.edition === 'wien') {
    involved = new Set(event.hosts.concat(event.participants));
  }

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

      ${urbanize.edition === 'berlin' ? `
        ${hosts(event.hosts)}
        ${participants(event.participants)}
        ` :
        hosts([...involved])
      }

      ${categories(event.categories)}
      ${tags(event.tags)}

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
