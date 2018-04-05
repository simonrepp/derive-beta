const footer = require('../widgets/footer.js'),
      header = require('../widgets/header.js'),
      sidebar = require('../widgets/sidebar.js');

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

      <script defer src="/bundle.js"></script>
    </head>

    <body>
      <div class="layout__split">
        <div class="layout__content">
          <div class="layout__header">
            <div class="layout__overlap layout__restraint">
              ${header(options)}
            </div>
          </div>

          <div class="layout__scroll">
            <div class="layout__offset layout__restraint">
              ${content}

              ${footer()}
            </div>
          </div>
        </div>

        <div class="layout__sidebar">
          ${sidebar}
        </div>
      </div>
    </body>
  </html>
`;
