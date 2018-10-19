const footer = require('../widgets/footer.js');
const header = require('../widgets/header.js');
const sidebar = require('../widgets/sidebar.js');

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
    if(urbanize.edition === 'berlin') {
      options.og.image = urbanize.base_url + '/images/berlin_opengraph.jpg';
      options.og.imageHeight = 1262;
      options.og.imageWidth = 816;
    } else {
      options.og.image = urbanize.base_url + '/images/graetzelhood_facebook.jpg';
      options.og.imageHeight = 1200;
      options.og.imageWidth = 630;
    }
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

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="theme-color" content="#ffffff">

        <meta property="og:description" content="${options.description}">
        <meta property="og:image" content="${options.og.image}">
        <meta property="og:image:width" content="${options.og.imageWidth}">
        <meta property="og:image:height" content="${options.og.imageHeight}">
        <meta property="og:image:type" content="${options.og.imageType}">
        <meta property="og:image:alt" content="${options.title}">
        <meta property="og:title" content="${options.title}">
        <meta property="og:type" content="website">

        <link rel="stylesheet" href="/styles.css?${urbanize.assetHash}">

        <script defer src="/bundle.js?${urbanize.assetHash}"></script>
      </head>

      <body style="background-image: url(${urbanize.background});">
        <div class="restraint">
          ${header(urbanize)}

          <div class="split">
            <div class="${options.tiles ? 'tiles' : 'content'} offset">
              ${content}
            </div>

            ${sidebar(urbanize)}
          </div>

          ${footer(urbanize)}
        </div>
      </body>
    </html>
  `;

  return html;
};
