const footer = require('../widgets/layout/footer.js');
const header = require('../widgets/layout/header.js');
const sidebar = require('../widgets/sidebar/sidebar.js');

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

      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
      <meta name="msapplication-TileColor" content="#da532c">
      <meta name="theme-color" content="#ffffff">

      <link rel="stylesheet" href="/styles.css">
    </head>

    <body>
      <div class="layout__scroll">
        ${content}
      </div>
    </body>
  </html>
`;
