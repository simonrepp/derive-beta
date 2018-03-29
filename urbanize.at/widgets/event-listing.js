const timeframe = require('./timeframe.js');

module.exports = events => `
  <div>
    ${events.map(event => `
      <div class="list-item">
        ${event.image ? `
          <img class="teaser-image" src="${event.image.written}" />
        `:''}

        <div class="emphasized">
          <a href="/veranstaltungen/${event.permalink}/">
            ${event.title}
          </a>
        </div>

        <div class="additional">
          ${timeframe(event)}
          &nbsp;
          ${event.address}
        </div>
        <div>
          ${event.abstract}
        </div>
      </div>
    `).join('')}
  </div>
`;
