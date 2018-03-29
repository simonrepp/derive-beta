const { CompositeDisposable, Disposable } = require('atom'),
      fs = require('fs'),
      remote = require('remote'),
      path = require('path'),
      shell = require('shell');

const buildDerive = require('../derive.at/build.js'),
      buildUrbanize = require('../urbanize.at/build.js'),
      DeriveDocumentationView = require('./derive-documentation-view.js'),
      serve = require('./serve.js'),
      SuggestionProvider = require('./suggestion-provider.js'),
      sync = require('./sync.js'),
      transform = require('../derive-common/transform.js');

const data = {
  articles: new Map(),
  articlesByPermalink: new Map(),
  articlesByTitle: new Map(),
  authors: [],
  bookAuthors: [],
  books: new Map(),
  booksByPermalink: new Map(),
  booksByTitle: new Map(),
  buildDir: path.join(remote.app.getPath('temp'), 'derive-build'),
  cache: new Map(),
  categories: new Map(),
  events: new Map(),
  eventsByPermalink: new Map(),
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
  publishers: [],
  root: atom.config.get('derive-beta.databaseDirectory'),
  tags: new Map(),
  warnings: []
};

module.exports = {
  config: {
    databaseDirectory: {
      default: '',
      description: 'Das Stammverzeichnis in dem auf diesem Computer die derive Website Dateien liegen',
      title: 'Derive Website Ordner',
      type: 'string'
    },
    // fastMode: {
    //   default: true,
    //   description: 'Reduziert den Grad der Parallelisierung beim Generieren der Website - stabiler aber langsamer.',
    //   title: 'Stabilitätsmodus',
    //   type: 'boolean'
    // }
  },
  subscriptions: null,
  activate() {
    atom.config.set('whitespace.removeTrailingWhitespace', false, { scopeSelector: '.source.plain' });

    const commands = {
      'derive-beta:backup': () => this.backup(),
      'derive-beta:deploy-derive.at': () => this.build('derive.at', true),
      'derive-beta:deploy-staging.derive.at': () => this.build('staging.derive.at'),
      'derive-beta:deploy-urbanize.at': () => this.build('urbanize.at', true),
      'derive-beta:deploy-staging.urbanize.at': () => this.build('staging.urbanize.at'),
      'derive-beta:deploy-berlin.urbanize.at': () => this.build('berlin.urbanize.at', true),
      'derive-beta:deploy-staging.berlin.urbanize.at': () => this.build('staging.berlin.urbanize.at'),
      'derive-beta:list-tags': () => this.listTags(),
      'derive-beta:markdown-reference': () => this.openReference('markdown.md', 'Markdown Handbuch.md'),
      'derive-beta:plaindata-reference': () => this.openReference('plaindata.plain', 'Plain Data Handbuch.plain'),
      'derive-beta:article-reference': () => this.openReference('article.plain', 'Artikel Spezifikation.plain'),
      'derive-beta:book-reference': () => this.openReference('book.plain', 'Buch Spezifikation.plain'),
      'derive-beta:event-reference': () => this.openReference('event.plain', 'Veranstaltung Spezifikation.plain'),
      'derive-beta:issue-reference': () => this.openReference('issue.plain', 'Ausgabe Spezifikation.plain'),
      'derive-beta:page-reference': () => this.openReference('page.plain', 'Seiten Spezifikation.plain'),
      'derive-beta:player-reference': () => this.openReference('player.plain', 'Akteur Spezifikation.plain'),
      'derive-beta:program-reference': () => this.openReference('program.plain', 'Radiosendung Spezifikation.plain'),
      'derive-beta:new-article': () => this.newTemplate('article'),
      'derive-beta:new-book': () => this.newTemplate('book'),
      'derive-beta:new-event': () => this.newTemplate('event'),
      'derive-beta:new-issue': () => this.newTemplate('issue'),
      'derive-beta:new-page': () => this.newTemplate('page'),
      'derive-beta:new-player': () => this.newTemplate('player'),
      'derive-beta:new-program': () => this.newTemplate('program'),
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
    )

    const init = () => {
      atom.workspace.observeTextEditors(editor => {
        editor.onDidSave(() => {
          if(editor.getPath().includes(data.root)) {
            this.refresh();
          }
        });
      });

      this.refresh();

      this.server = serve(data);
    };

    if(atom.config.get('derive-beta.databaseDirectory')) {
      init();
    } else {
      const configNotification = atom.notifications.addInfo(
        '**derive konfigurieren**',
        {
          buttons: [{
            onDidClick: () => {
              atom.pickFolder(paths => {
                if(paths) {
                  atom.config.set('derive-beta.databaseDirectory', paths[0]);
                  data.root = paths[0];

                  configNotification.dismiss();

                  init();
                }
              });
            },
            text: 'Derive Website Ordner auswählen'
          }],
          description: '**Anleitung:** Wähle das Verzeichnis in dem sich die Ordner *Akteure*, *Bücher*, *Radiosendungen*, *Seiten*, *Texte*, *Veranstaltungen* und *Zeitschrift*. befinden.\n\nFalls die Daten über Seafile noch nicht fertig synchronisiert sind, warte noch ab bis alle Daten heruntergeladen wurden.',
          detail: 'Um das derive Website Plugin zu aktivieren muss zunächst noch das Verzeichnis mit den Daten der Website ausgewählt werden.',
          dismissable: true,
          icon: 'issue-reopened'
        }
      );
    }

    // atom.workspace.toggle('atom://derive-documentation');
  },
  deactivate() {
    this.server.kill();
    this.subscriptions.dispose();
  },
  backup() {
    atom.confirm({
      message: 'Du bist dabei ein Backup der gesamten Website Daten auf den Server hochzuladen.',
      detail: 'Es müssen mehrere Gigabyte an Daten hochgeladen werden, der Vorgang dauert mindestens 15 Minuten, willst du fortfahren?',
      buttons: ['Fortfahren', 'Abbrechen']
    }, async response => {
      if (response === 0) {
        atom.notifications.addInfo('Daten werden hochgeladen.');
        // TODO: Perform backup
      }
    });
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
          await buildDerive(data);
        } else if(site.match(/berlin\.urbanize\.at/)) {
          await buildUrbanize(data, 'berlin');
        } else if(site.match(/urbanize\.at/)) {
          await buildUrbanize(data, 'wien');
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
        await sync(data, site);
      } catch(err) {
        syncingInfo.dismiss();
        atom.notifications.addError(
          '**${site}**\n\nBeim synchronisieren ist ein Fehler aufgetreten, die Seite konnte nicht aktualisiert werden.',
          {
            detail: err.toString(),
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
            onDidClick: () => shell.openExternal(`https://${site.replace(/\.at$/, '.fdpl.io')}`),
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
    // TODO: Display time statistics (refreshing took ... seconds) ?

    const refreshingInfo = atom.notifications.addInfo(
      `**derive**\n\nDaten werden aktualisiert.`,
      {
        dismissable: true,
        icon: 'issue-reopened'
      }
    );

    await transform(data);

    refreshingInfo.dismiss();

    if(data.warnings) {
      const notifications = () => {
        data.warnings.forEach(warning =>
          atom.notifications.addWarning(
            warning.header,
            {
              buttons: warning.files ? warning.files.map(file => ({
                onDidClick: () => {
                  if(path.extname(file.path) === '.plain') {
                    atom.workspace.open(
                      path.join(data.root, file.path),
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
                    shell.openItem(path.join(data.root, file.path));
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

      if(data.warnings.length > 3) {
        const allPrompt = atom.notifications.addWarning(
          `**derive**\n\nBeim analysieren der Daten wurden ${data.warnings.length} Probleme festgestellt.`,
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
                  const report = data.warnings.map(warning =>
                    `${warning.header}\n${warning.detail}\n${warning.description}\n${warning.files.map(file => file.path).join(', ')}`
                  ).join('\n\n------------------------------------------\n\n')

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
        '**derive**\n\nDaten aktualisiert, alles passt zusammen!',
        { icon: 'issue-closed' }
      );
    }
  },
  async newTemplate(document) {
    const editor = await atom.workspace.open();

    const templatePath = path.join(__dirname, `../templates/${document}`);
    const templateText = fs.readFileSync(templatePath, 'utf-8');

    editor.insertText(templateText);
    editor.setGrammar(atom.grammars.grammarForScopeName('source.plain'));
  },
  async listTags() {
    const editor = await atom.workspace.open(null, { split: 'right' });

    const templatePath = path.join(__dirname, '../templates/article.plain');
    const template = fs.readFileSync(templatePath, 'utf-8');

    editor.insertText(Object.keys(data.tags).sort().join('\n'));
  },
  async openReference(document, filename) {
    const temporaryPath = path.join(remote.app.getPath('temp'), filename);
    const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

    const referencePath = path.join(__dirname, `../reference/${document}`);
    const reference = fs.readFileSync(referencePath, 'utf-8');

    editor.setText(reference);
    editor.save();
  },
  getProvider() {
    return new SuggestionProvider(data);
  },
  deserializeDeriveDocumentationView(serialized) {
    return new DeriveDocumentationView();
  }
};
