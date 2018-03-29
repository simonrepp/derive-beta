const moment = require('moment');

const eventListing = require('../widgets/event-listing.js'),
      layout = require('../layout.js');

module.exports = (urbanize, date, events) => {
  const timeframe = date instanceof Date ? `am ${moment(date).format('D.MM.YYYY')}` : date;
  
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
        Alle Termine ${timeframe}
      </div>

      ${eventListing(events)}
    </div>
  `;

  return layout(html, urbanize, { title: `Alle Termine ${timeframe}` });
};
