const ical = require('ical-generator');
const moment = require('moment');
const striptags = require('striptags');
const { Base64 } = require('js-base64');

const { URBANIZE_YEAR } = require('../config.js');

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
      description: event.abstract ? striptags(event.abstract.converted) : '',
      end,
      htmlDescription: event.abstract ? event.abstract.converted : '',
      location: `${event.venue} ${event.address}`,
      organizer: 'Removed Below <mail@example.com>',
      start,
      summary: `urbanize! ${URBANIZE_YEAR}: ${event.title}`,
      timestamp: moment()
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
