const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, participant) => {
  const html = `
    <div>
      <h1>
        ${participant.name}
      </h1>

      ${participant.text ? participant.text : ''}

      ${eventListing(participant.events)}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize);
};
