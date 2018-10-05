const layout = require('./layout.js'),
      participantListing = require('../widgets/participant-listing.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="generic__heading">
        Beteiligte
      </div>

      ${participantListing(urbanize.hosts)}

      <div class="generic__heading">
        Gäste
      </div>

      ${participantListing(urbanize.participants)}
    </div>
  `;

  return layout(html, urbanize);
};
