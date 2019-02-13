module.exports = tags => tags.length > 0 ? `
  <p>
    TAGS<br>
    ${tags.map(tag => `
      <a href="/tags/${tag.permalink}/">
        ${tag.name}
      </a>
    `).join(', ')}
  </p>
`:'';
