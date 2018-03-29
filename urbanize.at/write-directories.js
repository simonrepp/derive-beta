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
  
  // TODO: Consider elsewhere - where relevant, that tags with / in the name cannot 1:1 map to that url,
  //       for obvious reasons, replace with - ... and consider generating a permalink on expand() to encapsulate it nicely
  
  urbanize.events.forEach(event => midDirectories.push(`veranstaltungen/${event.permalink}`));
  urbanize.pages.forEach(page => midDirectories.push(`seiten/${page.permalink}`));
  urbanize.categories.forEach((events, category) => midDirectories.push(`kategorien/${category.replace('/', '-')}`)); // TODO category permalink sani
  urbanize.tags.forEach((events, tag) => midDirectories.push(`tags/${tag.replace('/', '-')}`)); // TODO category permalink sani
  
  await Promise.all(midDirectories.map(dir => createDir(data.buildDir, dir)));
};