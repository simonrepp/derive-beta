module.exports = pages => `
  <div>
    ${pages.map(page => `
      <div class="list-item">
        <strong>
          <a href="/page/${page.permalink}/">
            ${page.title}
          </a>
        </strong>
      </div>
    `).join('')}
  </div>
`;
