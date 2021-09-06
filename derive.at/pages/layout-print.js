const footer = require('../widgets/layout/footer.js');
const header = require('../widgets/layout/header.js');
const sidebar = require('../widgets/sidebar.js');

const DEFAULT_TITLE = 'dérive | Zeitschrift für Stadtforschung';

module.exports = (content, options = {}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>
        ${options.title || DEFAULT_TITLE}
      </title>

      <meta charset="utf-8">
      <meta name="description" content="dérive">
      <link rel="icon" type="image/png" href="/favicon.png">
      <link rel="stylesheet" href="/styles.css">
    </head>

    <body>
      <div class="layout__scroll">
        ${content}
      </div>
    </body>
  </html>
`;
