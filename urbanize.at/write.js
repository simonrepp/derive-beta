const fsExtra = require('fs-extra'),
      path = require('path');

const categoryPage = require('./pages/category.js'),
      indexPage = require('./pages/index.js'),
      notFoundPage = require('./pages/404.js'),
      eventPage = require('./pages/event.js'),
      eventsPage = require('./pages/events.js'),
      pagePage = require('./pages/page.js'),
      participantsPage = require('./pages/participants.js'),
      searchPage = require('./pages/search.js'),
      tagPage = require('./pages/tag.js');


module.exports = async (data, city) => {
  const write = (html, filePath) => {
    return fsExtra.outputFile(path.join(data.buildDir, filePath), html);
  };

  const urbanize = data.urbanize[city];

  await Promise.all([
    write(eventsPage(urbanize, '2018', urbanize.events), '/veranstaltungen/index.html'),
    write(indexPage(urbanize), 'index.html'),
    write(notFoundPage(urbanize), 'seite-nicht-gefunden/index.html'),
    write(participantsPage(urbanize), '/teilnehmerinnen/index.html'),
    write(searchPage(urbanize), '/suche/index.html')
  ]);

  // TODO: possibly introduce the stableMode switch from config, maybe make it a factor too ?

  for(let [date, events] of urbanize.eventsByDate.entries()) {
    await write(eventsPage(urbanize, date, events), `${date}/index.html`);
  }

  for(let i = 0; i < urbanize.events.length; i++) {
    const event = urbanize.events[i];
    await write(eventPage(urbanize, event), `veranstaltungen/${event.permalink}/index.html`);
  }

  for(let i = 0; i < urbanize.pages.length; i++) {
    const page = urbanize.pages[i];
    await write(pagePage(urbanize, page), `seiten/${page.permalink}/index.html`);
  }

  // TODO: Consider map for categories/tags
  for(let i = 0; i < Object.keys(urbanize.categories).length; i++) {
    const category = Object.keys(urbanize.categories)[i];
    const events = urbanize.categories[category];
    await write(categoryPage(urbanize, category, events), `kategorien/${category}/index.html`);
  }

  for(let i = 0; i < Object.keys(urbanize.tags).length; i++) {
    const tag = Object.keys(urbanize.tags)[i];
    const events = urbanize.tags[tag];
    await write(tagPage(urbanize, tag, events), `tags/${tag}/index.html`);
  }
};
