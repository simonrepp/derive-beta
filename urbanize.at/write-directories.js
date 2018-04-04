const fsExtra = require('fs-extra'),
      moment = require('moment');

const { createDir } = require('../derive-common/util.js');

module.exports = async (data, urbanize) => {
  await fsExtra.emptyDir(data.buildDir);

  const topDirectories = new Set([
    'kategorien',
    'seiten',
    'seite-nicht-gefunden',
    'suche',
    'tags',
    'teilnehmerinnen',
    'veranstaltungen'
  ]);

  urbanize.eventsByDate.forEach((events, date) =>
    topDirectories.add(moment(date).locale('de').format('D-MMMM-YYYY'))
  );

  await Promise.all([...topDirectories].map(dir => createDir(data.buildDir, dir)));

  const midDirectories = [];

  urbanize.events.forEach(event => midDirectories.push(`veranstaltungen/${event.permalink}`));
  urbanize.pages.forEach(page => midDirectories.push(`seiten/${page.permalink}`));
  urbanize.categories.forEach(category => midDirectories.push(`kategorien/${category.permalink}`));
  urbanize.tags.forEach(tag => midDirectories.push(`tags/${tag.permalink}`));

  await Promise.all(midDirectories.map(dir => createDir(data.buildDir, dir)));
};
