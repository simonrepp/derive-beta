module.exports = data => {
  data.urbanize = {
    berlin: {
      background: '/images/bewegung_macht_stadt.jpg',
      categories: new Map(),
      events: [],
      eventsByDate: new Map(),
      features: [],
      footer: '2018 URBANIZE! INTERNATIONALES FESTIVAL FÜR URBANE ERKUNDUNGEN BERLIN',
      pages: [],
      participants: new Set(),
      tags: new Map(),
      title: 'urbanize! 2018 - Bewegung macht Stadt'
    },
    wien: {
      background: '/images/graetzelhood.jpeg',
      categories: new Map(),
      events: [],
      eventsByDate: new Map(),
      features: [],
      footer: '2018 UR9ANIZE! INTERNATIONALES FESTIVAL FÜR URBANE ERKUNDUNGEN WIEN',
      pages: [],
      participants: new Set(),
      tags: new Map(),
      title: 'ur9anize! 2018 - Grätzelhood'
    }
  };

  data.features.forEach(feature => {
    ['berlin', 'wien'].forEach(city => {
      if(feature.urbanize === (city === 'berlin' ? 'Berlin 2018': 'Wien 2018')) {
        data.urbanize[city].features.push(feature);
      }
    });
  });

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

        event.categories.forEach(category => {
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

        event.hosts.forEach(host =>
          data.urbanize[city].participants.add(host)
        );

        event.participants.forEach(participant =>
          data.urbanize[city].participants.add(participant)
        );

        event.tags.forEach(tag => {
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
