const { writeFile } = require('../derive-common/util.js');

const startPage = require('./pages/index.js');
const notFoundPage = require('./pages/site-not-found.js');
const eventPage = require('./pages/event.js');
const newsletterPage = require('./pages/newsletter.js');
const pagePage = require('./pages/page.js');
const participantPage = require('./pages/participant.js');
const participantsPage = require('./pages/participants.js');
const programPage = require('./pages/program.js');

module.exports = data => {
    const { urbanize } = data;

    writeFile(data.buildDir, 'index.html', startPage(urbanize)),
    writeFile(data.buildDir, '/newsletter/index.html', newsletterPage(urbanize, 'public')),
    writeFile(data.buildDir, '/presse-newsletter/index.html', newsletterPage(urbanize, 'press')),
    writeFile(data.buildDir, '/seite-nicht-gefunden/index.html', notFoundPage(urbanize)),
    writeFile(data.buildDir, '/beteiligte/index.html', participantsPage(urbanize)),
    writeFile(data.buildDir, '/programm/index.html', programPage(urbanize))

    for(const event of Object.values(urbanize.events)) {
        writeFile(data.buildDir, `${event.permalink}/index.html`, eventPage(urbanize, event));
    }

    for(const page of Object.values(urbanize.pages)) {
        writeFile(data.buildDir, `${page.permalink}/index.html`, pagePage(urbanize, page));
    }

    for(const participant of urbanize.participants) {
        writeFile(data.buildDir, `${participant.permalink}/index.html`, participantPage(urbanize, participant));
    }
};
