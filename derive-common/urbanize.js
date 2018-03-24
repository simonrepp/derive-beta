module.exports = data => {
  data.urbanize = {
    berlin: {
      categories: {},
      events: [],
      eventsByDate: new Map(),
      pages: [],
      participants: new Set(),
      tags: {}
    },
    wien: {
      categories: {},
      events: [],
      eventsByDate: new Map(),
      pages: [],
      participants: new Set(),
      tags: {}
    }
  };

  data.events.forEach(event => {
    ['berlin', 'wien'].forEach(city => {
      if(event.urbanize === (city === 'berlin' ? 'Berlin 2018': 'Wien 2018')) {
        data.urbanize[city].events.push(event);

        const date = event.startDate;
        if(data.urbanize[city].eventsByDate.has(event.startDate)) {
          data.urbanize[city].eventsByDate.get(event.startDate).push(event);
        } else {
          data.urbanize[city].eventsByDate.set(event.startDate, [event]);
        }

        event.categories.forEach(category => {
          if(!data.urbanize[city].categories.hasOwnProperty(category)) {
            data.urbanize[city].categories[category] = [];
          }

          data.urbanize[city].categories[category].push(event);
        });

        event.hosts.forEach(host => data.urbanize[city].participants.add(host));
        event.participants.forEach(participant => data.urbanize[city].participants.add(participant));

        event.tags.forEach(tag => {
          if(!data.urbanize[city].tags.hasOwnProperty(tag)) {
            data.urbanize[city].tags[tag] = [];
          }

          data.urbanize[city].tags[tag].push(event);
        });
      }
    });
  });

  data.pages.forEach(page => {
    ['berlin', 'wien'].forEach(city => {
      if(page.urbanize === (city === 'berlin' ? 'Berlin 2018': 'Wien 2018')) {
        data.urbanize[city].pages.push(page);
      }
    });
  });

  console.log(data);
};
