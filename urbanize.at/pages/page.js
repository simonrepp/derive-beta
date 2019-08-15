const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      <div class="generic__heading">
        ${page.title}
      </div>

      <div class="generic__serif">
        ${page.text ? page.text.written : ''}
      </div>

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
