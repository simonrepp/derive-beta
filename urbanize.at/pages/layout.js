const footer = require('../widgets/footer.js');
const header = require('../widgets/header.js');
const { largeBanner, smallBanner } = require('../widgets/banners.js');

module.exports = (content, urbanize, options = {}) => {
    if(!options.banner) {
        options.banner = 'small';
    }

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
        options.og.image = urbanize.base_url + '/images/facebook.png';
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
                <meta name="viewport" content="width=device-width, initial-scale=1">

                <link rel="icon" type="image/png" href="/favicon.png">

                <meta property="og:description" content="${options.description}">
                <meta property="og:image" content="${options.og.image}?${urbanize.assetHash}">
                <meta property="og:image:width" content="${options.og.imageWidth}">
                <meta property="og:image:height" content="${options.og.imageHeight}">
                <meta property="og:image:type" content="${options.og.imageType}">
                <meta property="og:image:alt" content="${options.title}">
                <meta property="og:title" content="${options.title}">
                <meta property="og:type" content="website">

                <link rel="stylesheet" href="/styles.css?${urbanize.assetHash}">

                <script defer src="/scripts.js?${urbanize.assetHash}"></script>
            </head>

            ${options.slim ? `
                <body class="slim">
                    <div class="partition">
                        ${smallBanner('purple')}

                        <div class="content">
                            ${content}
                        </div>
                    </div>
                </body>
            `:`
                <body>
                    <div class="partition">
                        ${header(urbanize)}
                        ${options.banner === 'small' ? smallBanner('purple') : largeBanner}

                        <div>
                            <div class="content">
                                ${content}
                            </div>
                        </div>

                        ${footer(urbanize)}
                    </div>
                </body>
            `}

        </html>
    `;

    return html;
};
