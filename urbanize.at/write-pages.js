const moment = require('moment');

const { writeFile } = require('../derive-common/util.js');

const categoryPage = require('./pages/category.js'),
      indexPage = require('./pages/index.js'),
      notFoundPage = require('./pages/404.js'),
      eventPage = require('./pages/event.js'),
      eventsPage = require('./pages/events.js'),
      pagePage = require('./pages/page.js'),
      participantsPage = require('./pages/participants.js'),
      searchPage = require('./pages/search.js'),
      tagPage = require('./pages/tag.js');

module.exports = async (data, urbanize) => {
  await Promise.all([
    writeFile(data.buildDir, 'index.html', indexPage(urbanize)),
    writeFile(data.buildDir, 'seite-nicht-gefunden/index.html', notFoundPage(urbanize)),
    writeFile(data.buildDir, '/suche/index.html', searchPage(urbanize)),
    writeFile(data.buildDir, '/teilnehmerinnen/index.html', participantsPage(urbanize)),
    writeFile(data.buildDir, '/veranstaltungen/index.html', eventsPage(urbanize, '2018', urbanize.events))
  ]);

  for(let [date, events] of urbanize.eventsByDate.entries()) {
    await writeFile(data.buildDir, `${moment(date).locale('de').format('D-MMMM-YYYY')}/index.html`, eventsPage(urbanize, date, events));
  }

  for(let event of urbanize.events) {
    await writeFile(data.buildDir, `veranstaltungen/${event.permalink}/index.html`, eventPage(urbanize, event));
  }

  for(let page of urbanize.pages) {
    await writeFile(data.buildDir, `seiten/${page.permalink}/index.html`, pagePage(urbanize, page));
  }

  for(let category of urbanize.categories.values()) {
    await writeFile(data.buildDir, `kategorien/${category.permalink}/index.html`, categoryPage(urbanize, category));
  }

  for(let tag of urbanize.tags.values()) {
    await writeFile(data.buildDir, `tags/${tag.permalink}/index.html`, tagPage(urbanize, tag));
  }
};
