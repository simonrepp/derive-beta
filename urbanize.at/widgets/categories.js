module.exports = categories => {
  if(categories.length === 0) { return ''; }

  const html = `
    <p>
      KATEGORIEN<br/>
      ${categories.map(category => `
        <a href="/kategorie/${category}/">
          ${category}
        </a>
      `).join(', ')}
    </p>
  `;

  return html;
};
