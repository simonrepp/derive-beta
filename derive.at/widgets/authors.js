module.exports = authors => authors.length > 0 ? `
  ${authors.map(author => `
    <a class="generic__smaller_text" href="/autoren/${author.permalink}/">${author.name}</a>
  `).join(', ')}
`:'';
