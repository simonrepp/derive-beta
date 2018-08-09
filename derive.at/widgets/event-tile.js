const moment = require('moment');

const authors = require('./authors.js');

module.exports = event => `
  <div class="tile">
    <h1>
      <a href="/veranstaltungen/${event.permalink}/">
        ${event.title}
      </a>
    </h1>

    ${event.dates.map(date =>
      `${moment(date.date).format('D.M.YYYY')} ${date.time || ''}`.trim()
    ).join('<br/>')}

    ${event.image ? `
      <img src="${event.image.written}" />
    `:''}

    ${authors(event.hosts)}
    ${authors(event.participants)}

    <div class="generic__margin_vertical">
      ${event.abstract ? event.abstract.converted : ''}
    </div>
  </div>
`;
