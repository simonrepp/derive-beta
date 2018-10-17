const buildDerive = require('../derive.at/build.js');
const buildUrbanize = require('../urbanize.at/build.js');
const shell = require('shell');

module.exports = async (data, site) => {
  if(data.pending.action) {
    atom.notifications.addWarning(`**${site}**\n\nEin andererer Vorgang läuft gerade, die Seite kann erst generiert werden wenn dieser Vorgang abgeschlossen ist.`);
    return;
  } else if(data.errors.length > 0) {
    atom.notifications.addError(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
    return;
  }

  data.pending.action = `Seitenvorschau für ${site} wird generiert`;

  try {
    if(site.includes('derive.at')) {
      await buildDerive(data, { preview: true });
    } else {
      await buildUrbanize(data, site, { preview: true });
    }
  } catch(err) {
    atom.notifications.addError(
      'Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.',
      {
        detail: err,
        dismissable: true
      }
    );

    data.pending.action = null;

    return;
  }

  atom.notifications.addSuccess(
    `**${site}**\n\nSeite als Vorschau erfolgreich generiert - Du kannst sie nun auf diesem Computer unter der URL \`${data.serverUrl}\` im Browser testen!`,
    {
      buttons: [{
        onDidClick: () => shell.openExternal(data.serverUrl),
        text: 'Im Browser öffnen'
      }],
      dismissable: true,
      icon: 'issue-closed'
    }
  );

  data.pending.action = null;
};
