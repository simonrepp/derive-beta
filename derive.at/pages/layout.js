const footer = require('../widgets/layout/footer.js');
const header = require('../widgets/layout/header.js');
const sidebar = require('../widgets/sidebar/sidebar.js');

const DEFAULT_TITLE = 'dérive | Zeitschrift für Stadtforschung';

module.exports = (data, content, options = {}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>
        ${options.title || DEFAULT_TITLE}
      </title>

      <meta charset="utf-8">
      <meta name="description" content="dérive">
      <meta name="viewport" content="width=device-width, initial-scale=1">

      <link rel="icon" type="image/png" href="/favicon.png">

      <link rel="stylesheet" href="/styles.css?${data.assetHash}">

      <script src="/scripts.js?${data.assetHash}"></script>
    </head>

    <body>
      <div class="layout__split">
        <div class="layout__content">
          <div class="layout__scroll">

            <div class="layout__header">
              <div class="layout__restraint">
                ${header(options)}
              </div>
            </div>

            <div class="layout__offset layout__restraint">
              ${content}

              ${footer()}
            </div>

          </div>
        </div>

        <div class="layout__sidebar">
          ${sidebar(data)}
        </div>
      </div>

      ${options.script ? `<script>${options.script}</script>` : ''}
    </body>
  </html>
`;
