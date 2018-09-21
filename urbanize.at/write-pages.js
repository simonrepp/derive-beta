const moment = require('moment');

const { writeFile } = require('../derive-common/util.js');

const categoryPage = require('./pages/category.js');
const indexPage = require('./pages/index.js');
const notFoundPage = require('./pages/site-not-found.js');
const eventPage = require('./pages/event.js');
const eventsPage = require('./pages/events.js');
const pagePage = require('./pages/page.js');
const participantsPage = require('./pages/participants.js');
const searchPage = require('./pages/search.js');
const tagPage = require('./pages/tag.js');

module.exports = async (data, urbanize) => {
  await Promise.all([
    writeFile(data.buildDir, 'index.html', indexPage(urbanize)),
    writeFile(data.buildDir, 'seite-nicht-gefunden/index.html', notFoundPage(urbanize)),
    writeFile(data.buildDir, '/suche/index.html', searchPage(urbanize)),
    writeFile(data.buildDir, '/beteiligte/index.html', participantsPage(urbanize)),
    writeFile(data.buildDir, '/veranstaltungen/index.html', eventsPage(urbanize, null, urbanize.events))
  ]);

  for(let [date, events] of urbanize.eventsByDate.entries()) {
    await writeFile(data.buildDir, `${moment(date).locale('de').format('D-MMMM-YYYY')}/index.html`, eventsPage(urbanize, date, events));
  }

  for(let event of urbanize.events) {
    await writeFile(data.buildDir, `veranstaltungen/${event.permalink}/index.html`, eventPage(urbanize, event));
  }

  for(let page of urbanize.pages) {
    await writeFile(data.buildDir, `${page.permalink}/index.html`, pagePage(urbanize, page));
  }

  for(let category of urbanize.categories.values()) {
    await writeFile(data.buildDir, `kategorien/${category.permalink}/index.html`, categoryPage(urbanize, category));
  }

  for(let tag of urbanize.tags.values()) {
    await writeFile(data.buildDir, `tags/${tag.permalink}/index.html`, tagPage(urbanize, tag));
  }
};
