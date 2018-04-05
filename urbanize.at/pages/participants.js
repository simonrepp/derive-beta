const layout = require('./layout.js'),
      participantListing = require('../widgets/participant-listing.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        TeilnehmerInnen
      </div>

      <div class="title">
        TeilnehmerInnen
      </div>

      ${participantListing(urbanize.participants)}
    </div>
  `;

  return layout(html, urbanize);
};
