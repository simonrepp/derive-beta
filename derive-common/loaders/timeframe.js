module.exports = value => {
  const match = value.match(/(\d\d):(\d\d)\s*(?:-\s*(\d\d):(\d\d))?/);

  if(!match)
    throw 'Der Zeitrahmen muss im Format "14:00" oder "14:00-16:00" angegeben werden.';

  const timeframe = {
    raw: value,
    start: {
      hours: parseInt(match[1]),
      minutes: parseInt(match[2])
    }
  };

  if(match[3] && match[4]) {
    timeframe.end = {
      hours: parseInt(match[3]),
      minutes: parseInt(match[4])
    };
  }

  return timeframe;
};
