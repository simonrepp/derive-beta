const layout = require('../layout.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        ${page.title}
      </div>

      <div class="title">
        ${page.title}
      </div>

      <div>
        ${page.text ? page.text.written : ''}
      </div>
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
