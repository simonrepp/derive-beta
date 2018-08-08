const layout = require('./layout.js');

const featureSort = (a, b) => {
  if(a.type === 'landscape' && b.type !== 'landscape')
    return -1;
  if(b.type === 'landscape' && a.type !== 'landscape')
    return 1;

  if(a.type === 'portrait' && b.type !== 'portrait')
    return -1;
  if(b.type === 'portrait' && a.type !== 'portrait')
    return 1;

  if(a.type === 'card' && b.type !== 'card')
    return -1;
  if(b.type === 'card' && a.type !== 'card')
    return 1;

  return a.position - b.position
};

module.exports = data => {
  const sortedFeatures = Array.from(data.features.values()).sort(featureSort);

  const html = `
    <div class="features">
      ${sortedFeatures.map(feature => `
        <div class="feature_split feature__${feature.type}">
          <div class="feature_image"
               ${feature.image ? ` style="background-image: url(${feature.image.written});"` : ''} >
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
    </div>
  `;

  return layout(data, html);
};
