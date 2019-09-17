const moment = require('moment');

moment.updateLocale('de', {
  monthsShort : [
    'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
  ]
});

const timeframe = require('./timeframe.js');

module.exports = (event, date) => {
  if(!event.signupEmail)
    return '<span class="color_pink">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_pink">Anmeldung bereits ausgebucht</span>';

  return `
    <a class="button_rect_pink"
       href="mailto:${event.signupEmail}?subject=${encodeURIComponent(`Anmeldung für ${event.title} / ${moment(date.date).locale('de').format('dd, D MMM YYYY')}, ${timeframe(date)}`)}">
      Anmeldung
    </a>
  `;
};
