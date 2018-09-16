const moment = require('moment');

const eventListing = require('../widgets/event-listing.js'),
      layout = require('./layout.js');

module.exports = (urbanize, date, events) => {
  const title = date === null ? 'Alle Termine' : `Alle Termine am ${moment(date).locale('de').format('dddd, D.MM.YYYY')}`;

  const html = `
    <div>
      <div class="generic__heading">
        ${title}
      </div>

      ${eventListing(events)}
    </div>
  `;

  return layout(html, urbanize, { title: title });
};
