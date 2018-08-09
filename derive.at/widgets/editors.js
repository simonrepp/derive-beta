module.exports = editors => editors.length > 0 ? `
  <div class="generic__margin_vertical">
    <strong>Redaktion</strong><br/>
    ${editors.map(editor => `
      <a href="/autoren/${editor.permalink}/">${editor.name}</a>
    `).join(', ')}
  </div>
`:'';
