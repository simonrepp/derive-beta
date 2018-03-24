const eventListing = require('../widgets/event-listing.js')
      layout = require('../layout.js');

module.exports = (urbanize, tag, events) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        Tag: ${tag}
      </div>

      <div class="title">
        Tag: ${tag}
      </div>

      ${eventListing(events)}
    </div>
  `;

  return layout(html, urbanize, { title: tag });
};
