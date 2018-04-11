module.exports = authors => authors.length > 0 ? `
  ${authors.map(author => `
    <a href="/autoren/${author.permalink}/">${author.name}</a>
  `).join(', ')}
`:'';
