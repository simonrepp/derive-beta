const eventListing = require('../widgets/event-listing.js')
      layout = require('./layout.js');

module.exports = (urbanize, tag) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Tag: ${tag.name}
      </div>

      <div class="title">
        Tag: ${tag.name}
      </div>

      ${eventListing(tag.events)}
    </div>
  `;

  return layout(html, urbanize, { title: tag });
};
