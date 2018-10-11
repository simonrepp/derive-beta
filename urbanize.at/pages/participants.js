const layout = require('./layout.js'),
      participantListing = require('../widgets/participant-listing.js');

module.exports = urbanize => {
  let html;

  if(urbanize.edition === 'berlin') {
    html = `
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
  } else if(urbanize.edition === 'wien') {
    const involvedPlayers = new Set([...urbanize.hosts].concat([...urbanize.participants]));

    html = `
      <div>
        <div class="generic__heading">
          Beteiligte
        </div>

        ${participantListing(involvedPlayers)}
      </div>
    `;
  }

  return layout(html, urbanize);
};
