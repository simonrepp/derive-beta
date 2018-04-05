const eventListing = require('../widgets/event-listing.js'),
      layout = require('./layout.js');

module.exports = (urbanize, category) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Kategorie: ${category.name}
      </div>

      <div class="title">
        Kategorie: ${category.name}
      </div>

      ${eventListing(category.events)}
    </div>
  `;

  return layout(html, urbanize, { title: category });
};
