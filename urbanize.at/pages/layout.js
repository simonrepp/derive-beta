const footer = require('../widgets/footer.js'),
      header = require('../widgets/header.js'),
      sidebar = require('../widgets/sidebar.js');

const DEFAULT_TITLE = 'Ur9anize 2018';

module.exports = (content, urbanize, options = {}) => `
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
      <div>
        ${header}

        <div class="restraint">
          <div class="split">
            <div class="content">
              ${content}
            </div>

            ${sidebar(urbanize)}
          </div>

          ${footer}
        </div>
      </div>
    </body>
  </html>
`;
