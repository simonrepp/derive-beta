const eventListing = require('../widgets/event-listing.js'),
      layout = require('../layout.js');

module.exports = (urbanize, category, events) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Kategorie: ${category}
      </div>

      <div class="title">
        Kategorie: ${category}
      </div>

      ${eventListing(events)}
    </div>
  `;

  return layout(html, urbanize, { title: category });
};
