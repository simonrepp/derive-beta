module.exports = participants => participants && participants.length > 0 ? `
  <p>
    TEILNEHMER*INNEN<br>
    ${participants.map(participant => `
      <a href="/${participant.permalink}/">
        ${participant.name}
      </a>
    `).join(', ')}
  </p>
`:'';
