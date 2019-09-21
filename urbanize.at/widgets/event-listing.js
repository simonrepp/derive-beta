const moment = require('moment');

moment.updateLocale('de', {
  monthsShort : [
    'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
  ]
});

const signupButton = require('./signup_button.js');
const calendarButton = require('./calendar_button.js');
const timeframe = require('./timeframe.js');

const eventSort = (a, b) => {
  const dateDifference = a.date.date - b.date.date;

  if(dateDifference === 0)
    return a.date.time.raw > b.date.time.raw ? 1 : -1;

  return dateDifference;
};

module.exports = events => {
  const sortedEvents = [];

  for(const event of events) {
    for(const date of event.dates) {
      sortedEvents.push({ date, event });
    }
  }

  sortedEvents.sort(eventSort);

  return `
    <div>
      ${sortedEvents.map(({ date, event }) => `
        <div class="event_filterable" data-category="${event.category}" data-date="${moment(date.date).format('YYYY-MM-DD')}">
          <div class="event extra_indent">
            <div class="event_image_desktop">
              ${event.image ? `
                <img src="${event.image.written}">
              `:''}
              ${event.imageCredits ? `
                <div class="color_grey font_size_0_8 text_align_right">${event.imageCredits}</div>
              `:''}
            </div>

            <div class="event_details">
              <a class="button_rect_black_faux event_category_tag">
                ${event.category}
              </a>

              <strong class="color_pink">${moment(date.date).locale('de').format('dd, D MMM YYYY')}</strong><br>
              <strong class="color_pink">${timeframe(date)}</strong>

              <hr class="hairline">

              <div class="event_image_mobile">
                ${event.image ? `
                  <img src="${event.image.written}">
                `:''}
                ${event.imageCredits ? `
                  <div class="color_grey font_size_0_8 text_align_right">${event.imageCredits}</div>
                `:''}
              </div>

              <strong>${event.venue}</strong><br>
              <strong>
                ${event.mapLink ? `<a href="${event.mapLink}" target="_blank">${event.address}</a>` : event.address}
              </strong>

              ${event.directions ? `<br><em>${event.directions}</em>` : ''}

              <hr class="hairline">

              <h2>
                <a href="/${event.permalink}/">
                  ${event.title}
                </a>
              </h2>

              <div class="margin_y_0_5">
                ${event.abstract.converted.replace(/(?=<\/p>\s*$)/, `
                  <a href="/${event.permalink}/">
                    <img src="/images/arrow.svg">
                  </a>
                `)}
              </div>

              ${event.participants.length > 0 ? `
                <div class="margin_y_0_5">
                  <strong>
                    Mit
                    <a href="/${event.participants[0].permalink}/" target="_blank">
                      ${event.participants[0].name}
                    </a>

                    ${event.participants.length >= 3 ? event.participants.slice(1, event.participants.length - 1).map(participant => `
                      ,
                      <a href="/${participant.permalink}/" target="_blank">
                        ${participant.name}
                      </a>
                    `).join('') : ''}

                    ${event.participants.length >= 2 ? `
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
                  ${calendarButton(event, date)}
                </div>

                <div>
                  ${signupButton(event, date)}
                </div>
              </div>
            </div>
          </div>

          <hr>
        </div>
      `).join('')}
    </div>
  `;
};
