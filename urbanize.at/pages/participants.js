const layout = require('./layout.js');

module.exports = urbanize => {
  const html = `
    <div>
      <div class="generic__heading">
        Beteiligte
      </div>

      ${urbanize.participants.map(participant => `
        <div><a href="/${participant.permalink}/">${participant.name}</a></div>
      `).join('')}
    </div>
  `;

  return layout(html, urbanize);
};
