const buildDerive = require('../derive.at/build.js');
const buildUrbanize = require('../urbanize.at/build.js');

module.exports = async (data, site) => {
    if (data.errors.length > 0) {
        console.log(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
        return;
    }

    console.log(`Seitenvorschau für ${site} wird generiert`);

    try {
        if (site.includes('derive.at')) {
            await buildDerive(data, { preview: true });
        } else {
            await buildUrbanize(data, site, { preview: true });
        }
    } catch (err) {
        console.log('Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.');
        console.log(err);
    }

    console.log(`**${site}**\n\nSeite als Vorschau erfolgreich generiert - Du kannst sie nun auf diesem Computer unter der URL \`${data.serverUrl}\` im Browser testen!`);

    // TODO: shell.openExternal(data.serverUrl)
};
