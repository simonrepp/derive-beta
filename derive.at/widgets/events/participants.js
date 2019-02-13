// TODO: Generic implementation of this widget? (parameterize the title and whether there is one also)

module.exports = participants => participants.length > 0 ? `
  <div class="generic__margin_vertical">
    <strong>TeilnehmerInnen</strong><br>
    ${participants.map(participant => `
      <a href="/autoren/${participant.permalink}/">${participant.name}</a>
    `.trim()).join(', ')}
  </div>
`:'';
