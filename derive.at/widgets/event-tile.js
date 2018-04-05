const moment = require('moment');

const authors = require('./authors.js');

module.exports = event => `
  <div class="tile">
    <h1>
      <a href="/veranstaltungen/${event.permalink}/">
        ${event.title}
      </a>
    </h1>

    // TODO TIME

    ${event.image ? `
      <img src="${event.image.written}" />
    `:''}

    ${authors(event.hosts)}
    ${authors(event.participants)}

    <div class="generic__margin-vertical">
      ${event.abstract ? event.abstract : ''}
    </div>
  </div>
`;
