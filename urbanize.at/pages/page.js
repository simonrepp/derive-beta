const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      <h1>
        ${page.title}
      </h1>

      ${page.text ? page.text.written : ''}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
