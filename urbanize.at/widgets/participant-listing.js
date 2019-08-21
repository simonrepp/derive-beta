module.exports = participants => `
  <div>
    ${[...participants].sort((a, b) => a.name.localeCompare(b.name)).map(participant => `
      <div class="list-item">
        <strong>
          <a id="${participant.permalink}"></a>
          ${participant.name}
        </strong>

        ${participant.text ? participant.text.converted : (participant.biography ? participant.biography.converted : '')}

        ${participant.website ? `<a href="${participant.website}">${participant.website}</a>` : ''}
      </div>
    `).join('')}
  </div>
`;
