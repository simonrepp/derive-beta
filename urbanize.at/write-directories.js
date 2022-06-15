const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

module.exports = data => {
    fsExtra.emptyDirSync(data.buildDir);

    const dirs = new Set();

    dirs.add('beteiligte');
    dirs.add('newsletter');
    dirs.add('presse-newsletter');
    dirs.add('programm');
    dirs.add('seite-nicht-gefunden');
    
    Object.values(data.urbanize.events).forEach(event => dirs.add(event.permalink));
    Object.values(data.urbanize.pages).forEach(page => dirs.add(page.permalink));
    data.urbanize.participants.forEach(participant => dirs.add(participant.permalink));

    dirs.forEach(dir => fs.mkdirSync(path.join(data.buildDir, dir), { recursive: true }));
};
