const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${page.title}
      </div>

      ${page.text ? page.text.written : ''}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
