const footer = require('../widgets/footer.js');
const header = require('../widgets/header.js');

module.exports = (content, urbanize, options = {}) => {
  if(!options.description) {
    options.description = urbanize.title;
  }

  if(!options.title) {
    options.title = urbanize.title;
  }

  if(!options.og) {
    options.og = {};
  }

  if(!options.og.image) {
    options.og.image = urbanize.base_url + '/images/graetzelhood_facebook.jpg';
    options.og.imageHeight = 1200;
    options.og.imageWidth = 630;
  }

  if(/\.png(\?\d+)?$/i.test(options.og.image)) {
    options.og.imageType = 'image/png';
  } else if(/\.jpe?g(\?\d+)?$/i.test(options.og.image)) {
    options.og.imageType = 'image/jpeg';
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>
          ${options.title}
        </title>

        <meta charset="utf-8">
        <meta name="description" content="dérive">
        <meta name="turbolinks-cache-control" content="no-cache">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" type="image/png" href="/favicon.png">

        <meta property="og:description" content="${options.description}">
        <meta property="og:image" content="${options.og.image}">
        <meta property="og:image:width" content="${options.og.imageWidth}">
        <meta property="og:image:height" content="${options.og.imageHeight}">
        <meta property="og:image:type" content="${options.og.imageType}">
        <meta property="og:image:alt" content="${options.title}">
        <meta property="og:title" content="${options.title}">
        <meta property="og:type" content="website">

        <link rel="stylesheet" href="/styles.css?${urbanize.assetHash}">

        <script defer src="/scripts.js?${urbanize.assetHash}"></script>
      </head>

      <body>
        ${header(urbanize)}

        <div class="content">
          ${content}
        </div>

        ${footer(urbanize)}
      </body>
    </html>
  `;

  return html;
};
