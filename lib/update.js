const open = require('open');

const buildDerive = require('../derive.at/build.js');
const buildUrbanize = require('../urbanize.at/build.js');
const sync = require('./sync.js');

module.exports = async (data, site, confirm = false) => {
    if (data.errors.length > 0) {
        console.log(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
        return;
    }

    // if(confirm) {
    //   atom.confirm({
    //     message: `Du bist dabei eine der öffentlich erreichbaren Websites - ${site} - zu aktualisieren.`,
    //     detail: 'Willst du fortfahren?',
    //     buttons: ['Fortfahren', 'Abbrechen']
    //   }, async response => {
    //     if (response === 0) {
    //       await perform();
    //     }
    //   });
    // } else {
    //   await perform();
    // }

    const perform = async () => {
        console.log(`${site} wird generiert`);

        try {
            if (site.includes('derive.at')) {
                await buildDerive(data);
            } else {
                await buildUrbanize(data, site);
            }
        } catch (err) {
            console.log('Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.');
            console.log(err);
        }
    }

    await perform();

    console.log(`${site} wird hochgeladen`);

    try {
        // await sync(data, site);
    } catch (err) {
        console.log(`**${site}**\n\nBeim synchronisieren ist ein Fehler aufgetreten, die Seite konnte nicht aktualisiert werden.`);
        console.log(err);
    }

    console.log(`**${site}**\n\nDie Seite wurde erfolgreich aktualisiert!`);
    open(`https://${site}`);
};
