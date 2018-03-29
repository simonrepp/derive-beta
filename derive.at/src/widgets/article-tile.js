const moment = require('moment');

const authors = require('./authors.js');

module.exports = article => `
  <div class="tile">
    <h1>
      <a href="/radio/${article.permalink}/">
        ${article.title}
      </a>
    </h1>
    <h2>
      <a href="/radio/${article.permalink}/">
        ${article.subtitle}
      </a>
    </h2>

    ${article.image ? `
      <img src="${article.image.written}" /><br/><br/>
    `:''}

    TODO Ausgabe 2016 / 1<br/><br/>

    TODO Seiten: 32-34<br/><br/>
  </div>
`;
