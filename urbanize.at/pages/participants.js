const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  const participantsByLetter = [];

  for(const participant of urbanize.participants) {
    const letter = participant.name[0];

    if(participantsByLetter.hasOwnProperty(letter)) {
      participantsByLetter[letter].push(participant);
    } else {
      participantsByLetter[letter] = [participant];
    }
  }

  const html = `
    <div class="participants">
      <div class="generic__heading">
        Beteiligte:
      </div>

      ${Object.entries(participantsByLetter).map(([letter, participants]) => `
        <div class="letter">
          <div>
            ${letter}
          </div>
          <div>
            ${participants.map(participant => `
              <div><a href="/${participant.permalink}/">${participant.name}</a></div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize);
};
