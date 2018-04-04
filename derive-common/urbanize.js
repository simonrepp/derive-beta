module.exports = data => {
  data.urbanize = {
    berlin: {
      categories: new Map(),
      events: [],
      eventsByDate: new Map(),
      pages: [],
      participants: new Set(),
      tags: new Map()
    },
    wien: {
      categories: new Map(),
      events: [],
      eventsByDate: new Map(),
      pages: [],
      participants: new Set(),
      tags: new Map()
    }
  };

  data.events.forEach(event => {
    ['berlin', 'wien'].forEach(city => {
      if(event.urbanize === (city === 'berlin' ? 'Berlin 2018': 'Wien 2018')) {
        data.urbanize[city].events.push(event);

        event.dates.forEach(date => {
          if(data.urbanize[city].eventsByDate.has(date.date)) {
            data.urbanize[city].eventsByDate.get(date.date).push(event);
          } else {
            data.urbanize[city].eventsByDate.set(date.date, [event]);
          }
        });

        event.categories.forEach(category => {
          const existingCategory = data.urbanize[city].categories.get(category);

          if(existingCategory) {
            existingCategory.push(event);
          } else {
            data.urbanize[city].categories.set(category, [event]);
          }
        });

        event.hosts.connected.forEach(host =>
          data.urbanize[city].participants.add(host)
        );

        event.participants.connected.forEach(participant =>
          data.urbanize[city].participants.add(participant)
        );

        event.tags.forEach(tag => {
          const existingTag = data.urbanize[city].tags.get(tag);

          if(existingTag) {
            existingTag.push(event);
          } else {
            data.urbanize[city].tags.set(tag, [event]);
          }
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
};
