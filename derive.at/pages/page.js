const layout = require('./layout.js');

module.exports = (data, page) => {
  const html = `
    <div>
      ${page.text.written}
    </div>
  `;

  return layout(data, html, { title: page.title });
};
