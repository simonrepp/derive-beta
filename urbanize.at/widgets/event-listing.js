const timeframe = require('./timeframe.js');

const eventSort = (a, b) => {
  let aDate, bDate;

  if(a.dates && a.dates.length > 0) {
    aDate = a.dates[0].date;
  }

  if(b.dates && b.dates.length > 0) {
    bDate = b.dates[0].date;
  }

  const dateDifference = aDate - bDate;

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
      <div class="event margin_y_2_0">
        <div class="event_image">
          ${event.image ? `
            <img src="${event.image.written}">
          `:''}
          ${event.imageCredits ? `
            <!-- TODO: right aligned, testing -->
            <span class="color_grey font_size_0_8">${event.imageCredits}</span>
          `:''}
        </div>

        <div class="event_details">
          <!-- position: absolute, right: 0 etc. -->
          <a class="button_rect_black event_category_tag" href="#">
            ${event.category}
          </a>

          Mi, 9 OKT 2019<br>
          19:00
          == ${timeframe(event)}

          <hr class="hairline">

          <strong>${event.venue}</strong><br>
          <strong>${event.address}</strong>

          ${event.directions ? `
            <div class="margin_y_0_5">
              ${event.directions.converted}
            </div>
          ` : ''}

          <hr class="hairline">

          <h2>
            <a href="/${event.permalink}/">
              ${event.title}
            </a>
          </h2>

          <div class="margin_y_0_5">
            ${event.subtitle}

            <a href="/${event.permalink}/">
              <img src="/images/arrow.svg">
            </a>
          </div>

          ${event.additionalInfo ? `
            <div class="margin_y_0_5">
              ${event.additionalInfo.converted}
            </div>
          ` : ''}

          <a href="#">
            <img src="/images/calendar.svg"> Termin downloaden
          </a>

          <!-- TODO: No boolean field for this, no info where to link to -->
          <a class="button_rect_pink" href="">
            Anmeldung
          </a>
        </div>
      </div>

      <hr>
    `).join('')}
  </div>
`;
