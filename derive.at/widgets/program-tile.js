const editors = require('../widgets/editors.js'),
      firstBroadcast = require('../widgets/first-broadcast.js');

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

    ${editors(program.editors.connected)}

    ${firstBroadcast(program.firstBroadcast)}
  </div>
`;
