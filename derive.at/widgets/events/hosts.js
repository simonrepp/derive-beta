// TODO: Generic implementation of this widget? (parameterize the title and whether there is one also)

module.exports = hosts => hosts.length > 0 ? `
  <div class="generic__margin_vertical">
    <strong>VeranstalterInnen</strong><br>
    ${hosts.map(host => `
      <a href="/autoren/${host.permalink}/">${host.name}</a>
    `.trim()).join(', ')}
  </div>
`:'';
