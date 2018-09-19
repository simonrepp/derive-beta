const timeframe = require('./timeframe.js');

module.exports = events => `
  <div>
    ${events.map(event => `
      <div class="list-item">
        ${event.image ? `
          <img class="teaser-image" src="${event.image.written}">
        `:''}

        <strong class="generic__subheading">
          <a href="/veranstaltungen/${event.permalink}/">
            ${event.title}
          </a>
        </strong>

        <div class="additional">
          ${timeframe(event)}
          &nbsp;
          ${event.address}
        </div>

        <div class="generic__serif">
          ${event.abstract ? event.abstract.converted : ''}
        </div>
      </div>
    `).join('')}
  </div>
`;
