const { featureSort } = require('../../derive-common/util.js');
const layout = require('./layout.js');

module.exports = data => {
  const sortedFeatures = Array.from(data.features.values()).filter(feature => feature.urbanize === null).sort(featureSort);

  const html = `
    <div class="features">

      ${sortedFeatures.map(feature => `
        <div class="feature__${feature.type}">
          <div class="feature_split">
            <div class="feature_image" ${feature.image ? ` style="background-image: url(${feature.image.written});"` : ''} >
            </div>

            <div class="feature_text">
              ${feature.header ? `
                <div class="generic__serif">
                  ${feature.header}
                </div>
              `:''}

              <div class="generic__heading">
                ${feature.url ? `<a href="${feature.url}">${feature.title}</a>` : feature.title}
              </div>

              ${feature.text ? `<div class="generic__serif">${feature.text.converted}</div>` : ''}
            </div>
          </div>
        </div>
      `).join('')}

    </div>
  `;

  return layout(data, html);
};
