const { transaction } = require('mobx');

const buildDerive = require('../derive.at/build.js');
const buildUrbanize = require('../urbanize.at/build.js');
const shell = require('shell');
const sync = require('./sync.js');

module.exports = async (data, site, confirm = false) => {
  if(data.pending.action) {
    atom.notifications.addWarning(`**${site}**\n\nEin andererer Vorgang läuft gerade, die Seite kann erst generiert werden wenn dieser Vorgang abgeschlossen ist.`);
    return;
  } else if(data.errors.length > 0) {
    atom.notifications.addError(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
    return;
  }

  const perform = async () => {
    data.pending.action = `${site} wird generiert`;

    try {
      if(site.includes('derive.at')) {
        await buildDerive(data);
      } else {
        await buildUrbanize(data, site);
      }
    } catch(err) {
      atom.notifications.addError(
        'Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.',
        {
          detail: err.stack,
          dismissable: true
        }
      );

      data.pending.action = null;

      return;
    }

    data.pending.action = `${site} wird hochgeladen`;

    try {
      await sync(data, site);
    } catch(err) {
      atom.notifications.addError(
        `**${site}**\n\nBeim synchronisieren ist ein Fehler aufgetreten, die Seite konnte nicht aktualisiert werden.`,
        {
          detail: err ? err.toString() : err,
          dismissable: true
        }
      );

      transaction(() => {
        data.pending.action = null;
        data.pending.details = null;
      });

      return;
    }

    atom.notifications.addSuccess(
      `**${site}**\n\nDie Seite wurde erfolgreich aktualisiert!`,
      {
        buttons: [{
          onDidClick: () => shell.openExternal(`https://${site}`),
          text: 'Im Browser öffnen'
        }],
        dismissable: true,
        icon: 'issue-closed'
      }
    );

    transaction(() => {
      data.pending.action = null;
      data.pending.details = null;
    });
  };

  if(confirm) {
    atom.confirm({
      message: `Du bist dabei eine der öffentlich erreichbaren Websites - ${site} - zu aktualisieren.`,
      detail: 'Willst du fortfahren?',
      buttons: ['Fortfahren', 'Abbrechen']
    }, async response => {
      if (response === 0) {
        await perform();
      }
    });
  } else {
    await perform();
  }
};
