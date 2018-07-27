const layout = require('./layout.js');

module.exports = data => {
  const html = `
    ${Array.from(data.features.values()).map(feature => `
      <div class="feature_split">
        <div class="feature_image">
          ${feature.image ? `
            <img src="${feature.image.written}"/>
          `:''}
        </div>

        <div class="feature_text">
          ${feature.header ? `
            <div class="generic__serif">
              ${feature.header}
            </div>
          `:''}

          <div class="generic__heading">
            <a href="${feature.url}">
              ${feature.title}
            </a>
          </div>

          ${feature.text ? feature.text.converted : ''}
        </div>
      </div>
    `).join('')}
  `;

  return layout(data, html);
};
