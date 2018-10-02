const { CompositeDisposable, Disposable, Emitter } = require('atom');
const fs = require('fs');
const remote = require('remote');
const packageDeps = require('atom-package-deps');
const path = require('path');
const shell = require('shell');

const backup = require('./backup.js');
const buildDerive = require('../derive.at/build.js');
const buildUrbanize = require('../urbanize.at/build.js');
const DeriveDocumentationView = require('./derive-documentation-view.js');
const menu = require('./menu');
const { loadEno } = require('../derive-common/util.js');
const serve = require('./serve.js');
const SuggestionProvider = require('./suggestion-provider.js');
const sync = require('./sync.js');
const transform = require('../derive-common/transform.js');

module.exports = {
  emitter: new Emitter(),

  data: {
    articles: new Map(),
    authors: [],
    bookAuthors: [],
    books: new Map(),
    booksPaginated: [],
    buildDir: path.join(remote.app.getPath('temp'), 'derive-build'),
    cache: new Map(),
    categories: new Map(),
    errors: [],
    events: new Map(),
    features: new Map(),
    festival: null,
    issues: new Map(),
    media: new Map(),
    pages: new Map(),
    players: new Map(),
    programs: new Map(),
    programsPaginated: [],
    publishers: [],
    radio: null,
    readableArticles: [],
    tags: new Map(),
    warnings: []
  },

  subscriptions: null,

  async activate() {
    packageDeps.install('derive-beta');
    atom.config.set('whitespace.removeTrailingWhitespace', false, { scopeSelector: '.text.eno' });

    const register = async changePathSubscription => {
      const projectFolders = atom.project.getPaths();

      for(let directory of projectFolders) {
        const configPath = path.join(directory, 'derive.eno');

        if(fs.existsSync(configPath)) {
          const config = await loadEno(directory, 'derive.eno');
          const result = {};

          for(let site of config.elements()) {
            result[site.name] = {
              directory: site.name === 'defaults' ? null : site.field('directory', { required: true }),
              host: site.field('host', { required: true }),
              user: site.field('user', { required: true })
            };
          }

          this.data.config = result;
          this.data.root = directory;
        }
      }

      if(this.data.config && this.data.root) {
        changePathSubscription.dispose();
        this.registerPlugin();
      }
    };

    const changePathSubscription = atom.project.onDidChangePaths(paths => register(changePathSubscription));

    register(changePathSubscription);
  },

  async registerPlugin() {
    const commands = {
      'derive-beta:backup': () => this.backupConfirm(),
      'derive-beta:deploy-berlin.urbanize.at': () => this.build('berlin.urbanize.at', true),
      'derive-beta:deploy-derive.at': () => this.build('derive.at', true),
      'derive-beta:deploy-urbanize.at': () => this.build('urbanize.at', true),
      'derive-beta:deploy-staging.berlin.urbanize.at': () => this.build('staging.berlin.urbanize.at'),
      'derive-beta:deploy-staging.derive.at': () => this.build('staging.derive.at'),
      'derive-beta:deploy-staging.urbanize.at': () => this.build('staging.urbanize.at'),
      'derive-beta:preview-derive.at': () => this.preview('derive.at'),
      'derive-beta:preview-urbanize.at': () => this.preview('urbanize.at'),
      'derive-beta:preview-berlin.urbanize.at': () => this.preview('berlin.urbanize.at'),
      'derive-beta:list-articles': () => this.listView('articles', 'Artikel Auflistung.txt'),
      'derive-beta:list-books': () => this.listView('books', 'Bücher Auflistung.txt'),
      'derive-beta:list-events': () => this.listView('events', 'Veranstaltungen Auflistung.txt'),
      'derive-beta:list-features': () => this.listView('features', 'Feature Auflistung.txt'),
      'derive-beta:list-issues': () => this.listView('issues', 'Zeitschriften Auflistung.txt'),
      'derive-beta:list-pages': () => this.listView('pages', 'Seiten Auflistung.txt'),
      'derive-beta:list-players': () => this.listView('players', 'Akteur Auflistung.txt'),
      'derive-beta:list-programs': () => this.listView('programs', 'Radiosendungen Auflistung.txt'),
      'derive-beta:list-categories': () => this.listView('categories', 'Kategorien Auflistung.txt'),
      'derive-beta:list-tags': () => this.listView('tags', 'Tag Auflistung.txt'),
      'derive-beta:markdown-reference': () => this.openReference('markdown.md', 'Markdown Handbuch.md'),
      'derive-beta:eno-reference': () => shell.openExternal('https://eno-lang.org/'),
      'derive-beta:article-reference': () => this.openReference('article.eno', 'Artikel Spezifikation.eno'),
      'derive-beta:book-reference': () => this.openReference('book.eno', 'Buch Spezifikation.eno'),
      'derive-beta:event-reference': () => this.openReference('event.eno', 'Veranstaltung Spezifikation.eno'),
      'derive-beta:feature-reference': () => this.openReference('feature.eno', 'Feature Spezifikation.eno'),
      'derive-beta:issue-reference': () => this.openReference('issue.eno', 'Zeitschrift Spezifikation.eno'),
      'derive-beta:insert-media': () => this.insertMedia(),
      'derive-beta:page-reference': () => this.openReference('page.eno', 'Seiten Spezifikation.eno'),
      'derive-beta:player-reference': () => this.openReference('player.eno', 'Akteur Spezifikation.eno'),
      'derive-beta:program-reference': () => this.openReference('program.eno', 'Radiosendung Spezifikation.eno'),
      'derive-beta:new-article': () => this.newTemplate('article.eno'),
      'derive-beta:new-book': () => this.newTemplate('book.eno'),
      'derive-beta:new-event': () => this.newTemplate('event.eno'),
      'derive-beta:new-feature': () => this.newTemplate('feature.eno'),
      'derive-beta:new-issue': () => this.newTemplate('issue.eno'),
      'derive-beta:new-page': () => this.newTemplate('page.eno'),
      'derive-beta:new-player': () => this.newTemplate('player.eno'),
      'derive-beta:new-program': () => this.newTemplate('program.eno'),
      'derive-beta:refresh': () => this.refresh(),
      'derive-beta:toggle-panel': () => this.togglePanel()
    };

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', commands),
      atom.workspace.addOpener(uri =>  {
        if(uri === 'atom://derive-documentation') {
          return new DeriveDocumentationView(this.data, this.emitter);
        }
      }),
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if(item instanceof DeriveDocumentationView) {
            item.destroy();
          }
        });
      })
    );

    atom.workspace.observeTextEditors(editor => {
      editor.onDidSave(() => {
        if(editor.getPath().includes(this.data.root)) {
          this.refresh();
        }
      });
    });

    this.refresh();

    serve(this.data);

    atom.menu.add(menu);
  },

  togglePanel() {
    atom.workspace.toggle('atom://derive-documentation');
  },

  deactivate() {
    if(this.data.backupProcess) { this.data.backupProcess.kill(); }
    if(this.data.server) { this.data.server.close(); }
    if(this.data.syncProcess) { this.data.syncProcess.kill(); }
    if(this.subscriptions) { this.subscriptions.dispose(); }
  },

  async backupConfirm() {
    atom.confirm({
      message: 'Du bist dabei ein Backup der gesamten Website Daten auf den Server hochzuladen.',
      detail: 'Es müssen mehrere Gigabyte an Daten hochgeladen werden, der Vorgang kann mehrere Stunden dauern, willst du fortfahren?',
      buttons: ['Fortfahren', 'Abbrechen']
    }, async response => {
      if(response === 0) {
        const syncingInfo = atom.notifications.addInfo(
          '**backup.derive.at**\n\nEin Backup der gesamten Website Daten wird auf den dérive Server hochgeladen.',
          {
            description: 'Es kann sinnvoll sein diese Benachrichtigung nicht zu schliessen, da ansonsten die Gefahr besteht zu vergessen, dass im Hintergrund nach wie vor ein Backupvorgang läuft, bitte nach eigenem Ermessen abwägen.',
            detail: 'Der Backupvorgang kann grundsätzlich jederzeit pausiert werden - wenn Atom beendet wird passiert das automatisch - jedoch sollte der Vorgang im Laufe des Tages zu Ende geführt werden (durch nochmaliges aufrufen von "Server Backup erstellen"), da ansonsten ein unvollständiges Tagesbackup am Server zurückbleibt, dass später zu Verwirrung führen kann, abgesehen davon dass nicht alle Daten gesichert sind.',
            dismissable: true
          }
        );

        try {
          await backup(this.data);

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
  },

  async preview(site) {
    if(this.data.refreshing) {
      atom.notifications.addWarning(`**${site}**\n\nDie Daten werden gerade aktualisiert, die Seite kann erst generiert werden wenn dieser Vorgang abgeschlossen ist.`);
      return;
    } else if(this.data.errors.length > 0) {
      atom.notifications.addError(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
      return;
    }

    const generatingInfo = atom.notifications.addInfo(
      `**${site}**\n\nDie Seite wird als Vorschau generiert.`,
      {
        icon: 'issue-reopened',
        dismissable: true
      }
    );

    try {
      if(site === 'derive.at') {
        await buildDerive(this.data, { preview: true });
      } else if(site === 'berlin.urbanize.at') {
        await buildUrbanize(this.data, 'berlin', { preview: true });
      } else if(site === 'urbanize.at') {
        await buildUrbanize(this.data, 'wien', { preview: true });
      }
    } catch(err) {
      generatingInfo.dismiss();
      atom.notifications.addError(
        'Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.',
        {
          detail: err,
          dismissable: true
        }
      );

      return;
    }

    generatingInfo.dismiss();

    if(this.data.serverUrl) {
      atom.notifications.addSuccess(
        `**${site}**\n\nSeite als Vorschau erfolgreich generiert - Du kannst sie nun auf diesem Computer unter der URL \`${this.data.serverUrl}\` im Browser testen!`,
        {
          buttons: [{
            onDidClick: () => shell.openExternal(this.data.serverUrl),
            text: 'Im Browser öffnen'
          }],
          dismissable: true,
          icon: 'issue-closed'
        }
      );
    } else {
      atom.notifications.addError(
        `**${site}**\n\nDie Seite wurde erfolgreich generiert, es scheint aber ein Problem mit lokalen Server zu geben, wurde eine Fehlermeldung diesbezüglich angezeigt? Zur Lösung sollte zunächst Atom neu gestartet werden, falls dass nicht hilft kann in zweiter Instanz ein Neustart des Computers oder, falls verfügbar, ein Update des derive Plugins helfen.`
      );
    }
  },

  async build(site, confirm = false) {
    if(this.data.refreshing) {
      atom.notifications.addWarning(`**${site}**\n\nDie Daten werden gerade aktualisiert, die Seite kann erst generiert werden wenn dieser Vorgang abgeschlossen ist.`);
      return;
    } else if(this.data.errors.length > 0) {
      atom.notifications.addError(`**${site}**\n\nEs liegen gerade kritische Fehler in den Basisdaten vor, die Seite kann erst wieder generiert werden wenn diese gelöst sind.`);
      return;
    }

    const perform = async () => {
      const timeEstimate = site.match(/derive\.at/) ? 'in etwa eine Minute' : 'ein paar Sekunden';
      const generatingInfo = atom.notifications.addInfo(
        `**${site}**\n\nDie Seite wird generiert, das dauert ${timeEstimate}.`,
        {
          icon: 'issue-reopened',
          dismissable: true
        }
      );

      try {
        if(site.match(/derive\.at/)) {
          await buildDerive(this.data);
        } else if(site.match(/berlin\.urbanize\.at/)) {
          await buildUrbanize(this.data, 'berlin');
        } else if(site.match(/urbanize\.at/)) {
          await buildUrbanize(this.data, 'wien');
        }
      } catch(err) {
        generatingInfo.dismiss();
        atom.notifications.addError(
          'Beim generieren der Seite ist ein Fehler aufgetreten, die Seite konnte nicht generiert werden.',
          {
            detail: err.stack,
            dismissable: true
          }
        );

        return;
      }

      generatingInfo.dismiss();
      const syncingInfo = atom.notifications.addSuccess(
        `**${site}**\n\nSeite erfolgreich generiert! Nun werden die neuen Dateien hochgeladen, je nach Verbindung dauert das in etwa 5-20 Sekunden.`,
        {
          icon: 'issue-reopened',
          dismissable: true
        }
      );

      try {
        await sync(this.data, site);
      } catch(err) {
        syncingInfo.dismiss();
        atom.notifications.addError(
          '**${site}**\n\nBeim synchronisieren ist ein Fehler aufgetreten, die Seite konnte nicht aktualisiert werden.',
          {
            detail: err ? err.toString() : err,
            dismissable: true
          }
        );

        return;
      }

      syncingInfo.dismiss();
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
  },

  insertMedia() {
    var files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openFile'],
      defaultPath: this.data.root,
      buttonLabel: 'Pfad einfügen'
    });
    if(files && files.length) {
      const relative = atom.project.relativizePath(files[0]);
      atom.workspace.getActiveTextEditor().insertText(relative[1]);
    }
  },

  async refresh() {
    this.data.refreshing = true;
    this.emitter.emit('refresh');

    await transform(this.data);

    if(this.data.errors.length > 0 || this.data.warnings.length > 0) {
      atom.workspace.open('atom://derive-documentation');

      // atom.notifications.addWarning(
      //   `**dérive**\n\nBeim analysieren der Daten wurden ${this.data.warnings.length} Probleme festgestellt.`,
      //
      //     detail: 'Anmerkung: Da viele Entitäten im Datenbestand vielschichtig miteinander vernetzt sind, kann ein einziger Fehler (zum Beispiel ein nicht lesbarer Akteur Datensatz) viele weitere Folgefehler nach sich ziehen (zum Beispiel dass sämtliche Artikel des nicht lesbaren Akteurs dann nicht mehr mit selbigem verlinked werden könen) - In dieser Hinsicht sollte der Gesamtzahl der Fehler keine grosse Bedeutung beigemessen werden!',
      //     description: 'Bis zur Lösung der Probleme können die betroffenen Seiten der Website nicht generiert bzw. aktualisiert werden, abgesehen davon gibt es keine Auswirkungen.\n\nDie erstgereihten Fehler sollten stets zuerst gelöst werden, da, wie erwähnt, spätere Fehler oft lediglich Folgefehler darstellen.',
      //     icon: 'issue-opened'
      //   }
      // );
    } else {
      atom.notifications.addSuccess(
        '**dérive**\n\nDaten aktualisiert, alles passt zusammen!',
        { icon: 'issue-closed' }
      );
    }

    this.data.refreshing = false;
    this.emitter.emit('refresh');
  },

  async newTemplate(document) {
    const editor = await atom.workspace.open();

    const templatePath = path.join(__dirname, `../templates/${document}`);
    const templateText = fs.readFileSync(templatePath, 'utf-8');

    editor.setText(templateText);
    editor.setGrammar(atom.grammars.grammarForScopeName('text.eno'));
  },

  async listView(collection, filename) {
    const temporaryPath = path.join(remote.app.getPath('temp'), filename);
    const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

    if(collection.match(/categories|tags/)) {
      editor.setText(Array.from(this.data[collection].values()).map(entry => entry.name).sort().join('\n'));
    } else if(collection.match(/players/)) {
      editor.setText(Array.from(this.data.players.values()).map(player => player.name).sort().join('\n'));
    } else if(collection.match(/issues/)) {
      editor.setText(Array.from(this.data.issues.values())
                          .map(issue => issue.number)
                          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join('\n'));
    } else {
      editor.setText(Array.from(this.data[collection].values()).map(document => document.title).sort().join('\n'));
    }

    editor.setCursorScreenPosition([0, 0]);
    editor.save();
  },

  async openReference(document, filename) {
    const temporaryPath = path.join(remote.app.getPath('temp'), filename);
    const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

    const referencePath = path.join(__dirname, `../reference/${document}`);
    const reference = fs.readFileSync(referencePath, 'utf-8');

    editor.setText(reference);
    editor.setCursorScreenPosition([0, 0]);
    editor.save();
  },

  getProvider() {
    return new SuggestionProvider(this.data);
  },

  deserializeDeriveDocumentationView() {
    return new DeriveDocumentationView();
  }
};
