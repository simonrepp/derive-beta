const { featureSort } = require('../../derive-common/util.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = urbanize => {
  // const sortedFeatures = urbanize.features.sort(featureSort);

  const html = `
    <h1>${urbanize.home.title}</h1>
    <h2>${urbanize.home.timeframe}</h2>
    <div>[10 Jahre Urbanize Badge (grafisch, rund, leicht seitlich)]</div>
    <div>[Collage und Infos (above the fold)]</div>

    <br><br><br><br><br><br>

    <h3>[Statischer Kurz About Text] ${urbanize.home.shortDescription}</h3>

    <br><br><br><br>

    ${urbanize.home.features.map(feature => `
      <div>
        <a href="${feature.link}">${feature.title}</a><br>
        ${feature.text}<br>
      </div>
    `).join('<br><br>')}

    ${scrollToTop}
  `;

  // TODO: Re-use/remove
  //   <div class="features">
  //     ${sortedFeatures.map(feature => `
  //       <div class="feature_split feature__${feature.type}">
  //         <div class="feature_image"
  //              ${feature.image ? ` style="background-image: url(${feature.image.written});"` : ''} >
  //         </div>
  //
  //         <div class="feature_text">
  //           ${feature.header ? `
  //             <div class="generic__secondary">
  //               ${feature.header}
  //             </div>
  //           `:''}
  //
  //           <div class="generic__heading">
  //             <a href="${feature.url}">
  //               ${feature.title}
  //             </a>
  //           </div>
  //
  //           ${feature.text ? `<div class="generic__serif">${feature.text.converted}</div>` : ''}
  //         </div>
  //       </div>
  //     `).join('')}
  //   </div>
  // `;

  return layout(html, urbanize, { tiles: true, title: urbanize.title });
};
