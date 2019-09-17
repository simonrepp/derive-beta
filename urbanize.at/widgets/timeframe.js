module.exports = date => {
  const { end, start } = date.time;

  if(end) {
    return `${('0' + start.hours).slice(-2)}:${('0' + start.minutes).slice(-2)}–${('0' + end.hours).slice(-2)}:${('0' + end.minutes).slice(-2)}`;
  } else {
    return `${('0' + start.hours).slice(-2)}:${('0' + start.minutes).slice(-2)}`;
  }
};
