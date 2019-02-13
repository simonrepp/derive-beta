const moment = require('moment');

module.exports = event => `
  <span>
    ${event.dates.map(date =>
      `${moment(date.date).format('D.M.YYYY')} ${date.time || ''}`.trim()
    ).join('<br>')}
  </span>
`;
