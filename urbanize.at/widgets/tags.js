module.exports = tags => {
  if(tags.length === 0) { return ''; }

  const html = `
    <p>
      TAGS<br/>
      ${tags.map(tag => `
        <a href="/tag/${tag}/">
          ${tag}
        </a>
      `).join(', ')}
    </p>
  `;

  return html;
};
