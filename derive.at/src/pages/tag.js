const layout = require('../layout.js');

module.exports = (tag, content) => {
  const html = `
    <div>
      All content with tag ${tag}

      ${Object.keys(content).map(section => `
        ${section} TODO translate

        ${content[section].map(item => `
            TODO - generic problably does not work here
            ${item.title}
        `)}
      `)}
    </div>
  `;

  return layout(html, { title: tag });
};
