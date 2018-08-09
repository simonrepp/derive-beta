const moment = require('moment');

module.exports = firstBroadcast => `
  <div class="generic__margin_vertical">
    <strong>Erstaustrahlung</strong><br/>
    ${moment(firstBroadcast).locale('de').format('Do MMMM YYYY')}
  </div>
`;
