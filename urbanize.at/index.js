const striptags = require('striptags');

const { writeFile } = require('../derive-common/util.js');

const indexEvents = urbanize => {
  const indexed = urbanize.events.map(event => {
    const boosted = `${event.title} ${event.subtitle || ''}`;
    const regular = [event.address || '',
                     event.abstract ? striptags(event.abstract.sourced) : '',
                     event.additionalInfo ? striptags(event.additionalInfo.sourced) : '',
                     event.categories.connected.map(category => category.name).join(' '),
                     event.hosts.connected.map(host => host.name).join(' '),
                     event.participants.connected.map(participant => participant.name).join(' '),
                     event.tags.connected.map(tag => tag.name).join(' '),
                     event.text ? striptags(event.text.written) : ''].join(' ');

    return {
      event: {
        abstract: event.abstract ? { sourced: event.abstract.sourced } : null,
        address: event.address,
        dates: event.dates,
        image: event.image ? { written: event.image.written } : null,
        permalink: event.permalink,
        title: event.title
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return indexed;
};

const indexPages = urbanize => {
  const indexed = urbanize.pages.map(page => {
    const boosted = page.title;
    const regular = page.text ? striptags(page.text.written) : '';

    return {
      page: {
        permalink: page.permalink,
        title: page.title
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return indexed;
};

module.exports = (data, urbanize) => {
  const index = [].concat(indexEvents(urbanize), indexPages(urbanize));

  return writeFile(data.buildDir, '/suche/index.json', JSON.stringify(index));
};
