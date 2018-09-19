module.exports = participants => `
  <div>
    ${[...participants].map(participant => `
      <div class="list-item">
        <strong>
          ${participant.name}
        </strong>

        <div class="generic__serif">
          ${participant.text ? participant.text.converted : (participant.biography ? participant.biography.converted : '')}
        </div>

        ${participant.website ? `<a href="${participant.website}">${participant.website}</a>` : ''}
      </div>
    `).join('')}
  </div>
`;
