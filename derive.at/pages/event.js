const hosts = require('../widgets/events/hosts.js');
const layout = require('./layout.js');
const participants = require('../widgets/events/participants.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');
const timeframe = require('../widgets/events/timeframe.js');

module.exports = (data, event) => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        ${event.image ? `<img src="${event.image.written}">` : ''}
      </div>

      <div class="generic__featured_text">
        <h1>${event.title}</h1>

        ${event.subtitle ? `
          <strong>${event.subtitle}</strong>
        `:''}

        ${event.urbanize ? `
          <div class="generic__margin_vertical">
            <strong>Urbanize Festival</strong><br/>
            ${event.urbanize}
          </div>
        `:''}

        ${hosts(event.hosts)}
        ${participants(event.participants)}

        <div class="generic__margin_vertical">
          ${timeframe(event)} ${event.address}
        </div>

        ${event.additionalInfo ? `
          <div class="generic__margin_vertical">
            ${event.additionalInfo.converted}
          </div>
        ` : ''}

        ${event.abstract ? `
          <div class="generic__margin_vertical generic__serif">
            ${event.abstract.converted}
          </div>
        ` : ''}

        ${tags(event.tags)}

        ${share(event.title, `/veranstaltungen/${event.permalink}/`)}
      </div>
    </div>

    ${event.text ? `
      <hr/>

      <div class="generic__serif">
        ${event.text.written}
      </div>
    ` : ''}
  `;

  return layout(data, html, { title: event.title });
};
