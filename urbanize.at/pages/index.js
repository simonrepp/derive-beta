const { featureSort } = require('../../derive-common/util.js');
const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

const feature = feature => `
  <div class="feature margin_y_2_0">
    <img src="${feature.image.written}">
    ${feature.imageCredits ? `
      <div class="color_grey font_size_0_8 text_align_right">${feature.imageCredits}</div>
    ` : ''}
    <hr class="hairline">
    <h1><a href="${feature.link}">${feature.title}</a></h1>
    <hr class="hairline">

    ${feature.text.converted}

    <hr>
  </div>
`;

module.exports = urbanize => {
  // const sortedFeatures = urbanize.features.sort(featureSort);

  const html = `
    <div class="features alignment_desktop">
      <div>${urbanize.home.features.filter((_, index) => index % 2 === 0).map(feature).join('')}</div>
      <div>${urbanize.home.features.filter((_, index) => index % 2 === 1).map(feature).join('')}</div>
    </div>

    <div class="features alignment_mobile">
      ${urbanize.home.features.map(feature).join('')}
    </div>

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

  return layout(html, urbanize, { banner: 'large', title: urbanize.title });
};
