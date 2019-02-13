module.exports = categories => categories.length > 0 ? `
  <p>
    KATEGORIEN<br>
    ${categories.map(category => `
      <a href="/kategorien/${category.permalink}/">
        ${category.name}
      </a>
    `).join(', ')}
  </p>
`:'';
