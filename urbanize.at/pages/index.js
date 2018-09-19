const { featureSort } = require('../../derive-common/util.js');
const layout = require('./layout.js');

module.exports = urbanize => {
  const sortedFeatures = urbanize.features.sort(featureSort);

  const html = `
    <div class="features">
      ${sortedFeatures.map(feature => `
        <div class="feature_split feature__${feature.type}">
          <div class="feature_image"
               ${feature.image ? ` style="background-image: url(${feature.image.written});"` : ''} >
          </div>

          <div class="feature_text">
            ${feature.header ? `
              <div class="generic__secondary">
                ${feature.header}
              </div>
            `:''}

            <div class="generic__heading">
              <a href="${feature.url}">
                ${feature.title}
              </a>
            </div>

            ${feature.text ? `<div class="generic__serif">${feature.text.converted}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return layout(html, urbanize, { tiles: true, title: urbanize.title });
};
