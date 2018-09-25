module.exports = participants => `
  <div>
    ${[...participants].sort((a, b) => a.name.localeCompare(b.name)).map(participant => `
      <div class="list-item">
        <strong>
          <a id="${participant.permalink}"></a>
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
