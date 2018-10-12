const path = require('path');
const { spawn } = require('child_process');
const { transaction } = require('mobx');

const performBackup = data => new Promise((resolve, reject) => {
  const backupConfig = data.config['backup.derive.at'];
  const today = new Date().toISOString().substr(0, 10);
  const backupDir = path.join(backupConfig.directory, today, '/');

  data.pending.action = 'Server Backup wird erstellt';

  const rsync = spawn(
    'rsync',
    [
      '-avz',
      '--delete',
      path.join(data.root, '/'),
      '-e', 'ssh -o StrictHostKeyChecking=no',
      `${backupConfig.user}@${backupConfig.host}:${backupDir}`
    ]
  );

  rsync.stdout.on('data', payload => {
    data.pending.details = payload.toString();
  });

  rsync.stderr.on('data', payload => {
    data.pending.details = payload.toString();
  });

  rsync.on('close', code => {
    data.backupProcess = null;

    transaction(() => {
      data.pending.action = null;
      data.pending.details = null;
    });

    if(code === 0) {
      resolve();
    } else {
      reject();
    }
  });

  data.backupProcess = rsync;
});

module.exports = async data => {
  if(data.pending.action) {
    atom.notifications.addWarning(`**backup.derive.at**\n\nEin andererer Vorgang läuft gerade, das Server Backup kann erst gestartet werden wenn dieser Vorgang abgeschlossen ist.`);
    return;
  }

  atom.confirm({
    message: 'Du bist dabei ein Backup der gesamten Website Daten auf den Server hochzuladen.',
    detail: 'Es müssen mehrere Gigabyte an Daten hochgeladen werden, der Vorgang kann mehrere Stunden dauern, willst du fortfahren?',
    buttons: ['Fortfahren', 'Abbrechen']
  }, async response => {
    if(response === 0) {

      // TODO: This message could go away (or be only concisely formulated, of temporary nature and not dismissable) as soon as dashboard pending status is shown
      const syncingInfo = atom.notifications.addInfo(
        '**backup.derive.at**\n\nEin Backup der gesamten Website Daten wird auf den dérive Server hochgeladen.',
        {
          detail: 'Der Backupvorgang kann grundsätzlich jederzeit pausiert werden - wenn Atom beendet wird passiert das automatisch - jedoch sollte der Vorgang im Laufe des Tages zu Ende geführt werden (durch nochmaliges aufrufen von "Server Backup erstellen"), da ansonsten ein unvollständiges Tagesbackup am Server zurückbleibt, dass später zu Verwirrung führen kann, abgesehen davon dass nicht alle Daten gesichert sind.',
          dismissable: true
        }
      );

      try {
        await performBackup(data);

        syncingInfo.dismiss();
        atom.notifications.addSuccess(
          '**backup.derive.at**\n\nEin Backup aller Website Daten wurde erfolgreich am dérive Server hinterlegt.',
          { dismissable: true }
        );
      } catch(err) {
        syncingInfo.dismiss();
        atom.notifications.addError(
          '**backup.derive.at**\n\nDas Backup aller Website Daten auf den dérive Server ist fehlgeschlagen. In der Regel ist dies lediglich ein temporäres Verbindungsproblem bei Internetausfällen oder Wartungsarbeiten am Server, ein späterer Versuch (in ein paar Stunden oder am nächsten Tag) wird somit erstmal empfohlen.',
          {
            detail: err,
            dismissable: true
          }
        );
      }
    }
  });
};
