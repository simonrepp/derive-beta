const moment = require('moment');

const authors = require('./authors.js');

module.exports = program => `
  <div class="tile">
    <h1>
      <a href="/radio/${program.permalink}/">
        ${program.title}
      </a>
    </h1>

    ${program.subtitle ? `
      <h2>
        <a href="/radio/${program.permalink}/">
          ${program.subtitle}
        </a>
      </h2>
    `:''}


    <strong>Redaktion</strong><br/>

    ${authors(program.editors.connected)}

    <br/><br/>

    <strong>Erstaustrahlung</strong><br/>

    ${moment(program.firstBroadcast).locale('de').format('Do MMMM YYYY')}
  </div>
`;
