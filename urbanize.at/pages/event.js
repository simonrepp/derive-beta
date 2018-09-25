const addThis = require('../widgets/add-this.js');
const categories = require('../widgets/categories.js');
const participants = require('../widgets/participants.js');
const tags = require('../widgets/tags.js');
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
        ${timeframe(event)}<br/>
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
        <hr/>

        <div class="generic__serif">
           ${event.text.written}
        </div>
      `:''}

      <hr/>

      ${participants(event.participants)}
      ${categories(event.categories)}
      ${tags(event.tags)}

      ${addThis(`https://berlin.urbanize.at/veranstaltungen/${event.permalink}/`)}
    </div>
  `;

  return layout(html, urbanize, { title: event.title });
};
