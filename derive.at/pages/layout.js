const { TOP } = require('../../derive-common/icons.js');
const FOOTER = require('../widgets/footer.js');
const { header } = require('../widgets/header.js');

const DEFAULT_TITLE = 'dérive | Zeitschrift für Stadtforschung';

module.exports = (data, content, options = {}) => `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${options.title || DEFAULT_TITLE}</title>
            <meta charset="utf-8">
            <meta name="description" content="dérive">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" type="image/png" href="/favicon.png">
            <link rel="stylesheet" href="/styles.css?${data.assetHash}">
            <script src="/scripts.js?${data.assetHash}"></script>
            ${options.extraScript ? `<script src="/${options.extraScript}?${data.assetHash}"></script>` : ''}
        </head>
        <body>
            ${header(options)}
            <main>
                ${content}
                <a class="to_top">
                    ${TOP}
                </a>
            </main>
            ${FOOTER}
        </body>
    </html>
`;
