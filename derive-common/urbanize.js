module.exports = data => {
  data.urbanize = {
    background: '/images/graetzelhood.png',
    categories: new Map(),
    events: [],
    eventsByDate: new Map(),
    features: [...data.features].filter(feature => feature.urbanize === '2019'), // TODO: Switch to maps to save us this whole stuff everywhere?
    hosts: new Set(),
    pages: [...data.pages].filter(page => page.urbanize === '2019'),
    participants: new Set(),
    tags: new Map(),
    title: 'urbanize! 2019'
  };

  data.events.forEach(event => {
    if(event.urbanize === '2019') {
      data.urbanize.events.push(event);

      event.dates.forEach(date => {
        const existingDate = data.urbanize.eventsByDate.get(date.date.toISOString());

        if(existingDate) {
          existingDate.push(event);
        } else {
          data.urbanize.eventsByDate.set(date.date.toISOString(), [event]);
        }
      });

      event.categories.forEach(category => {
        const existingCategory = data.urbanize.categories.get(category.permalink);

        if(existingCategory) {
          existingCategory.events.push(event);
        } else {
          const categoryData = {
            events: [event],
            name: category.name,
            permalink: category.permalink
          };

          data.urbanize.categories.set(category.permalink, categoryData);
        }
      });

      event.hosts.forEach(host =>
        data.urbanize.hosts.add(host)
      );

      event.participants.forEach(participant =>
        data.urbanize.participants.add(participant)
      );

      event.tags.forEach(tag => {
        const existingTag = data.urbanize.tags.get(tag.permalink);

        if(existingTag) {
          existingTag.events.push(event);
        } else {
          const tagData = {
            events: [event],
            name: tag.name,
            permalink: tag.permalink
          };

          data.urbanize.tags.set(tag.permalink, tagData);
        }
      });
    }
  });
};
