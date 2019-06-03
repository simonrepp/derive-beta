const layout = require('./layout.js');
const eventListing = require('../widgets/event-listing.js');

module.exports = (urbanize, participant) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${participant.name}
      </div>

      ${eventListing(participant.events)}
    </div>
  `;

  return layout(html, urbanize);
};
