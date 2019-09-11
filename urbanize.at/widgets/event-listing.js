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

          <strong class="color_pink">Mi, 9 OKT 2019</strong><br>
          <strong class="color_pink">19:00</strong>
          == ${timeframe(event)}

          <hr class="hairline">

          <strong>${event.venue}</strong><br>
          <strong>
            ${event.mapLink ? `<a href="${event.mapLink}" target="_blank">${event.address}</a>` : event.address}
          </strong>

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

          ${event.participants.length > 0 ? `
            <div class="margin_y_0_5">
              <strong>
                Mit
                <a href="/${event.participants[0].permalink}/" target="_blank">
                  ${event.participants[0].name}
                </a>

                ${event.participants >= 3 ? event.participants.slice(1, event.participants.length - 1).map(participant => `
                  ,
                  <a href="/${participant.permalink}/" target="_blank">
                    ${participant.name}
                  </a>
                `).join('') : ''}

                ${event.participants >= 2 ? `
                  und
                  <a href="/${event.participants[event.participants.length - 1].permalink}/" target="_blank">
                    ${event.participants[event.participants.length - 1].name}
                  </a>
                ` : ''}
              </strong>
            </div>
          ` : ''}

          ${event.additionalInfo ? `
            <div class="margin_y_0_5">
              ${event.additionalInfo.converted}
            </div>
          ` : ''}

          <div class="flex_split_lr margin_y_0_5">
            <div>
              <a class="event_download" href="#">
                <img src="/images/calendar.svg"> <span class="font_size_0_8">Termin downloaden</span>
              </a>
            </div>

            <div>
              ${event.signup ?
                  event.signup.full ?
                    '<span class="color_pink">Anmeldung bereits ausgebucht</span>'
                  : `
                    <!-- TODO: Include event date in prefilled email subject, Multiple signup buttons @ event details page -->
                    <a class="button_rect_pink" href="mailto:${event.signup.email}?subject=${encodeURIComponent(`Anmeldung für ${event.title}`)}">
                      Anmeldung
                    </a>
                  `
              : '<span class="color_pink">Keine Anmeldung notwendig</span>'}
            </div>
          </div>
        </div>
      </div>

      <hr>
    `).join('')}
  </div>
`;
