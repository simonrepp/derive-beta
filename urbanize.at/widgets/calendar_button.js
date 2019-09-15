const ical = require('ical-generator');
const moment = require('moment');
const { Base64 } = require('js-base64');

module.exports = (event, date) => {
  const start = moment(date.date);
  start.hours(date.time.start.hours);
  start.minutes(date.time.start.minutes);

  let end;
  if(date.time.end) {
    end = moment(date.date);
    end.hours(date.time.end.hours);
    end.minutes(date.time.end.minutes);
  }

  const icsContent = ical({
    domain: 'urbanize.at',
    events: [{
      start,
      end,
      timestamp: moment(),
      summary: `urbanize! 2019: ${event.title}`,
      organizer: 'Removed Below <mail@example.com>'
    }],
    name: 'Urbanize Festival Calendar',
    prodId: { company: 'derive.at', product: 'urbanize.at' },
    timezone: 'Europe/Vienna'
  }).toString().replace(/\nORGANIZER[^\n]+/, '');

  return `
    <a class="event_download"
       download="${event.title}.ics"
       href="data:text/calendar;base64,${Base64.encode(icsContent)}">
      <img src="/images/calendar.svg"> <span class="font_size_0_8">Termin downloaden</span>
    </a>
  `;
};
