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
          const existingDate = data.urbanize[city].eventsByDate.get(date.date.toISOString());

          if(existingDate) {
            existingDate.push(event);
          } else {
            data.urbanize[city].eventsByDate.set(date.date.toISOString(), [event]);
          }
        });

        event.categories.connected.forEach(category => {
          const existingCategory = data.urbanize[city].categories.get(category.permalink);

          if(existingCategory) {
            existingCategory.events.push(event);
          } else {
            const categoryData = {
              events: [event],
              name: category.name,
              permalink: category.permalink
            };

            data.urbanize[city].categories.set(category.permalink, categoryData);
          }
        });

        event.hosts.connected.forEach(host =>
          data.urbanize[city].participants.add(host)
        );

        event.participants.connected.forEach(participant =>
          data.urbanize[city].participants.add(participant)
        );

        event.tags.connected.forEach(tag => {
          const existingTag = data.urbanize[city].tags.get(tag.permalink);

          if(existingTag) {
            existingTag.events.push(event);
          } else {
            const tagData = {
              events: [event],
              name: tag.name,
              permalink: tag.permalink
            };

            data.urbanize[city].tags.set(tag.permalink, tagData);
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
