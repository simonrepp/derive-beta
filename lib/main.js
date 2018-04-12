const { CompositeDisposable, Disposable } = require('atom'),
      fs = require('fs'),
      remote = require('remote'),
      path = require('path'),
      shell = require('shell');

const backup = require('./backup.js'),
      buildDerive = require('../derive.at/build.js'),
      buildUrbanize = require('../urbanize.at/build.js'),
      DeriveDocumentationView = require('./derive-documentation-view.js'),
      { loadPlain } = require('../derive-common/util.js'),
      serve = require('./serve.js'),
      SuggestionProvider = require('./suggestion-provider.js'),
      sync = require('./sync.js'),
      transform = require('../derive-common/transform.js');

module.exports = {
  data: {
    articles: new Map(),
    articlesByPermalink: new Map(),
    articlesByTitle: new Map(),
    authors: [],
    bookAuthors: [],
    books: new Map(),
    booksByPermalink: new Map(),
    booksByTitle: new Map(),
    booksPaginated: [],
    buildDir: path.join(remote.app.getPath('temp'), 'derive-build'),
    cache: new Map(),
    categories: new Map(),
    events: new Map(),
    eventsByPermalink: new Map(),
    features: new Map(),
    issues: new Map(),
    issuesByNumber: new Map(),
    media: new Map(),
    pages: new Map(),
    pagesByPermalink: new Map(),
    players: new Map(),
    playersByName: new Map(),
    playersByPermalink: new Map(),
    programs: new Map(),
    programsByPermalink: new Map(),
    programsPaginated: [],
    publishers: [],
    readableArticles: [],
    tags: new Map(),
    warnings: []
  },
  subscriptions: null,
  async activate() {
    atom.config.set('whitespace.removeTrailingWhitespace', false, { scopeSelector: '.source.plain' });

    const projectFolders = atom.project.getPaths();

    for(let directory of projectFolders) {
      const configPath = path.join(directory, 'derive.plain');

      if(fs.existsSync(configPath)) {
        this.data.config = await loadPlain(directory, 'derive.plain');
        this.data.root = directory;
      }
    }

    if(!this.data.config || !this.data.root) {
      return;
    }

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
      'derive-beta:plaindata-reference': () => this.openReference('plaindata.plain', 'Plain Data Handbuch.plain'),
      'derive-beta:article-reference': () => this.openReference('article.plain', 'Artikel Spezifikation.plain'),
      'derive-beta:book-reference': () => this.openReference('book.plain', 'Buch Spezifikation.plain'),
      'derive-beta:event-reference': () => this.openReference('event.plain', 'Veranstaltung Spezifikation.plain'),
      'derive-beta:feature-reference': () => this.openReference('feature.plain', 'Feature Spezifikation.plain'),
      'derive-beta:issue-reference': () => this.openReference('issue.plain', 'Zeitschrift Spezifikation.plain'),
      'derive-beta:page-reference': () => this.openReference('page.plain', 'Seiten Spezifikation.plain'),
      'derive-beta:player-reference': () => this.openReference('player.plain', 'Akteur Spezifikation.plain'),
      'derive-beta:program-reference': () => this.openReference('program.plain', 'Radiosendung Spezifikation.plain'),
      'derive-beta:new-article': () => this.newTemplate('article.plain'),
      'derive-beta:new-book': () => this.newTemplate('book.plain'),
      'derive-beta:new-event': () => this.newTemplate('event.plain'),
      'derive-beta:new-feature': () => this.newTemplate('feature.plain'),
      'derive-beta:new-issue': () => this.newTemplate('issue.plain'),
      'derive-beta:new-page': () => this.newTemplate('page.plain'),
      'derive-beta:new-player': () => this.newTemplate('player.plain'),
      'derive-beta:new-program': () => this.newTemplate('program.plain'),
      'derive-beta:refresh': () => this.refresh(),
    };

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', commands),
      atom.workspace.addOpener(uri =>  {
        if(uri === 'atom://derive-documentation') {
          return new DeriveDocumentationView();
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

    // atom.workspace.toggle('atom://derive-documentation');
  },
  deactivate() {
    if(this.data.backupProcess) { this.data.backupProcess.kill(); }
    if(this.data.buildServerProcess) { this.data.buildServerProcess.kill(); }
    if(this.data.rootServerProcess) { this.data.rootServerProcess.kill(); }
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
      throw(err); // TODO: Remove later

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

    if(this.data.buildServerUrl && this.data.rootServerUrl) {
      atom.notifications.addSuccess(
        `**${site}**\n\nSeite als Vorschau erfolgreich generiert - Du kannst sie nun im Browser testen! \n\nTipp: Andere Computer im lokalen Netzwerk können den lokalen Vorschau Server auch abrufen - einfach im Browser zu der URL \`${this.data.buildServerUrl}\` navigieren.`,
        {
          buttons: [{
            onDidClick: () => shell.openExternal(this.data.buildServerUrl),
            text: 'Im Browser öffnen'
          }],
          dismissable: true,
          icon: 'issue-closed'
        }
      );
    } else {
      atom.notifications.addError(
        `**${site}**\n\nDie Seite wurde erfolgreich generiert, es scheint aber ein Problem mit einem Hintergrundprozess für den lokalen Server zu geben, wurde eine Fehlermeldung diesbezüglich angezeigt? Zur Lösung sollte zunächst Atom neu gestartet werden, falls dass nicht hilft kann in zweiter Instanz ein Neustart des Computers helfen.`
      );
    }
  },
  async build(site, confirm = false) {
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
            onDidClick: () => shell.openExternal(`https://${site.replace('derive.', 'derive.urbanize.')}`),
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
  async refresh() {
    const refreshingInfo = atom.notifications.addInfo(
      '**dérive**\n\nDaten werden aktualisiert.',
      {
        dismissable: true,
        icon: 'issue-reopened'
      }
    );

    await transform(this.data);

    refreshingInfo.dismiss();

    if(this.data.warnings) {
      const notifications = () => {
        this.data.warnings.forEach(warning =>
          atom.notifications.addWarning(
            warning.header,
            {
              buttons: warning.files ? warning.files.map(file => ({
                onDidClick: () => {
                  if(path.extname(file.path) === '.plain') {
                    atom.workspace.open(
                      path.join(this.data.root, file.path),
                      {
                        initialColumn: file.column || 0,
                        initialLine: file.line || 0
                      }
                    ).then(editor => {
                      if(file.hasOwnProperty('beginLine') && file.hasOwnProperty('beginColumn')) {
                        editor.addSelectionForBufferRange(
                          [[file.beginLine, file.beginColumn], [file.line, file.column]]
                        );
                      }
                    });
                  } else {
                    shell.openItem(path.join(this.data.root, file.path));
                  }
                },
                text: `${file.label || 'Datei'} öffnen`
              })) : [],
              dismissable: true,
              detail: warning.detail,
              description: warning.description,
              icon: 'issue-opened'
            }
          )
        );
      };

      if(this.data.warnings.length > 3) {
        const allPrompt = atom.notifications.addWarning(
          `**dérive**\n\nBeim analysieren der Daten wurden ${this.data.warnings.length} Probleme festgestellt.`,
          {
            buttons: [{
              onDidClick: () => {
                allPrompt.dismiss();
                notifications();
              },
              text: 'Alle Notifications'
            }, {
              onDidClick: () => {
                atom.workspace.open().then(editor => {
                  const report = this.data.warnings.map(warning =>
                    `${warning.header}\n${warning.detail}\n${warning.description}\n${warning.files ? warning.files.map(file => file.path).join(', ') : ''}`
                  ).join('\n\n------------------------------------------\n\n');

                  editor.insertText(report);
                });
              },
              text: 'Textuelle Auflistung'
            }],
            dismissable: true,
            detail: 'Anmerkung: Da viele Entitäten im Datenbestand vielschichtig miteinander vernetzt sind, kann ein einziger Fehler (zum Beispiel ein nicht lesbarer Akteur Datensatz) viele weitere Folgefehler nach sich ziehen (zum Beispiel dass sämtliche Artikel des nicht lesbaren Akteurs dann nicht mehr mit selbigem verlinked werden könen) - In dieser Hinsicht sollte der Gesamtzahl der Fehler keine grosse Bedeutung beigemessen werden!',
            description: 'Bis zur Lösung der Probleme können die betroffenen Seiten der Website nicht generiert bzw. aktualisiert werden, abgesehen davon gibt es keine Auswirkungen.\n\nDie erstgereihten Fehler sollten stets zuerst gelöst werden, da, wie erwähnt, spätere Fehler oft lediglich Folgefehler darstellen.',
            icon: 'issue-opened'
          }
        );
      } else {
        notifications();
      }
    } else {
      atom.notifications.addSuccess(
        '**dérive**\n\nDaten aktualisiert, alles passt zusammen!',
        { icon: 'issue-closed' }
      );
    }

    // TODO: Remove at some point (automatically build on refresh)
    // this.build('staging.derive.at');
    // this.preview('derive.at');
  },
  async newTemplate(document) {
    const editor = await atom.workspace.open();

    const templatePath = path.join(__dirname, `../templates/${document}`);
    const templateText = fs.readFileSync(templatePath, 'utf-8');

    editor.setText(templateText);
    editor.setGrammar(atom.grammars.grammarForScopeName('source.plain'));
  },
  async listView(collection, filename) {
    const temporaryPath = path.join(remote.app.getPath('temp'), filename);
    const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

    if(collection.match(/categories|tags/)) {
      editor.setText(Array.from(this.data[collection].keys()).sort().join('\n'));
    } else if(collection.match(/players/)) {
      editor.setText(Array.from(this.data.players.values()).map(player => player.name).sort().join('\n'));
    } else if(collection.match(/issues/)) {
      editor.setText(Array.from(this.data.issues.values()).map(issue => issue.number).sort((a, b) => a - b).join('\n'));
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
