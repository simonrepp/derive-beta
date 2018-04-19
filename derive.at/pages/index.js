const layout = require('./layout.js');

module.exports = data => {
  const html = `
    ${Array.from(data.features.values()).map(feature => `
      <div class="feature-large">
        ${feature.image ? `
          <img src="${feature.image.written}"/>
        `:''}

        <div>
          ${feature.header ? feature.header : ''}

          <h1>
            <a href="${feature.url}">
              ${feature.title}
            </a>
          </h1>

          ${feature.text ? feature.text.converted : ''}
        </div>
      </div>
    `).join('')}
  `;

  return layout(data, html);
};
