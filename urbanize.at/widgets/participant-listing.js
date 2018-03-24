module.exports = participants => `
  <div>
    ${[...participants].map(participant => `
      <div class="list-item">
        <strong class="emphasized">
          ${participant.name}
        </strong>

        <div>
          ${participant.text}
        </div>

        <a href="${participant.website}">
          ${participant.website}
        </a>
      </div>
    `).join('')}
  </div>
`;
