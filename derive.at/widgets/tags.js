module.exports = tags => tags.length > 0 ? `
  <div class="generic__margin_vertical">
    <strong>Tags</strong><br/>
    ${tags.map(tag => `
      <a class="generic__smaller_text" href="/tags/${tag.permalink}/">${tag.name}</a>
    `)}
  </div>
`:'';
