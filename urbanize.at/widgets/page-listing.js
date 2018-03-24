module.exports = pages => `
  <div>
    ${pages.map(page => `
      <div class="list-item">
        <div class="emphasized">
          <a href="/page/${page.permalink}/">
            ${page.title}
          </a>
        </div>
      </div>
    `).join('')}
  </div>
`;
