const moment = require('moment');

const datetime_formatted = (date, time) => {
  return `${date ? moment(date).format('DD.MM.YYYY') : ''} ${time}`.trim();
};

module.exports = event => {
  const { start_date, start_time, end_date, end_time } = event;

  const start_formatted = datetime_formatted(start_date, start_time);

  if(end_date || end_time) {
    return `
      <span>
        ${start_formatted} - ${datetime_formatted(end_date, end_time)}
      </span>
    `;
  } else {
    return `<span>${start_formatted}</span>`;
  }
};
