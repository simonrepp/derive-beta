const eventListing = require('../widgets/event-listing.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, participant) => {
  const html = `
    <div>
      <div class="extra_indent">
        <h1>
          ${participant.name}
        </h1>

        ${participant.text ? `
          <div class="margin_y_2_0">
          ${participant.text}
          </div>
        ` : ''}

        ${participant.links.length > 0 ? `
          <div class="margin_y_2_0">
            ${participant.links.map(link => `
                <a href="${link}" target="_blank">${link}</a><br>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <hr>

      ${eventListing(participant.events)}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize);
};
