const moment = require('moment');

const eventListing = require('../widgets/event-listing.js'),
      layout = require('../layout.js');

module.exports = (urbanize, date, events) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Programm
      </div>

      <div class="title">
        Alle Termine ${date.match(/^20\d\d$/) ? date : `am ${moment(date).format('D.MM.YYYY')}`}
      </div>

      ${eventListing(events)}
    </div>
  `;

  return layout(html, urbanize, { title: `Alle Termine ${date.match(/20\d\d/) ? date : `am ${moment(date).format('D.MM.YYYY')}`}` });
};
