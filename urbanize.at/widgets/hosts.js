module.exports = hosts => hosts.length > 0 ? `
  <p>
    BETEILIGTE<br>
    ${hosts.map(host => `
      <a href="/beteiligte/#${host.permalink}">
        ${host.name}
      </a>
    `).join(', ')}
  </p>
`:'';
