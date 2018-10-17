const timeframe = require('./timeframe.js');

const eventSort = (a, b) => {
  let aDate, bDate;

  if(a.dates && a.dates.length > 0) {
    aDate = a.dates[0].date;
  }

  if(b.dates && b.dates.length > 0) {
    bDate = b.dates[0].date;
  }

  const dateDifference = aDate - bDate

  if(dateDifference === 0) {
    let aTime, bTime;

    if(a.dates && a.dates.length > 0) {
      aTime = a.dates[0].time;
    }

    if(b.dates && b.dates.length > 0) {
      bTime = b.dates[0].time;
    }

    return aTime > bTime ? 1 : -1;
  } else {
    return dateDifference;
  }
};

module.exports = events => `
  <div>
    ${events.sort(eventSort).map(event => `
      <div class="list-item">
        ${event.image ? `
          <img class="teaser-image" src="${event.image.writtenCropped}">
        `:''}

        <strong class="generic__subheading">
          <a href="/veranstaltungen/${event.permalink}/">
            ${event.title}
          </a>
        </strong>

        <div class="additional">
          ${timeframe(event)}
          &nbsp;
          ${event.address}
        </div>

        <div class="generic__serif">
          ${event.abstract ? event.abstract.converted : ''}
        </div>
      </div>
    `).join('')}
  </div>
`;
