const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, participant) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${participant.name}
      </div>

      ${participant.text ? `<div class="generic__serif">${participant.text}</div>` : ''}

      ${eventListing(participant.events)}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize);
};
