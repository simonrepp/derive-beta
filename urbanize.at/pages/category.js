const eventListing = require('../widgets/event-listing.js'),
      layout = require('./layout.js');

module.exports = (urbanize, category) => {
  const html = `
    <div>
      <div class="generic__heading">
        Kategorie: ${category.name}
      </div>

      ${eventListing(category.events)}
    </div>
  `;

  return layout(html, urbanize, { title: category.name });
};
