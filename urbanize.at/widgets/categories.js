module.exports = categories => categories.length > 0 ? `
  <p>
    KATEGORIEN<br/>
    ${categories.map(category => `
      <a href="/kategorie/${category}/">
        ${category}
      </a>
    `).join(', ')}
  </p>
`:'';
