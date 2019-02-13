module.exports = participants => participants.length > 0 ? `
  <p>
    TEILNEHMER*INNEN<br>
    ${participants.map(participant => `
      <a href="/beteiligte/#${participant.permalink}">
        ${participant.name}
      </a>
    `).join(', ')}
  </p>
`:'';
