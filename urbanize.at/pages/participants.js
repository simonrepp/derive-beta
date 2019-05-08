const layout = require('./layout.js'),
      participantListing = require('../widgets/participant-listing.js');

module.exports = urbanize => {
  const involvedPlayers = new Set([...urbanize.hosts].concat([...urbanize.participants]));

  const html = `
    <div>
      <div class="generic__heading">
        Beteiligte
      </div>

      ${participantListing(involvedPlayers)}
    </div>
  `;

  return layout(html, urbanize);
};
