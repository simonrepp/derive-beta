const moment = require('moment');

// TODO: Uses artice-panel ... etc. css classes as generic templates although this is cinema

const infoDetails = screening => `
  ${screening.filmMeta}
  ${screening.eventMeta.converted}

  <strong>${moment(screening.date).format('D.M.YYYY')}</strong><br>
  <strong>${screening.time}</strong>

  <br><br>

  <strong>
    <a href="${screening.link}" target="_blank">
      Tickets
    </a>
  </strong>
`;

const info = screening => `
  <div class="generic__heading">
    <a href="/kino/${screening.permalink}/">${screening.title}</a>
  </div>

  <div class="article-panel__info-split">
    <div class="article-panel__info-cover">
      ${screening.image ? `<img src="${screening.image.written}">` : ''}
    </div>

    <div class="article-panel__info-details">
      ${infoDetails(screening)}
    </div>
  </div>
`;

module.exports = screening => `
  <div class="article-panel">
    <div class="article-panel__info">
      ${info(screening)}
    </div>

    <div class="article-panel__abstract generic__serif">
      ${screening.abstract.converted}

      <div class="generic__margin_vertical">
        <a href="/kino/${screening.permalink}/">Mehr Info und Trailer</a>
      </div>
    </div>
  </div>
`;
