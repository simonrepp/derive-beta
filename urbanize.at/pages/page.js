const layout = require('./layout.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${page.title}
      </div>

      <div>
        ${page.text ? page.text.written : ''}
      </div>
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
