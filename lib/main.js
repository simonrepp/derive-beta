
const { CompositeDisposable } = require('atom'),
      fs = require('fs'),
      remote = require('remote'),
      path = require('path'),
      shell = require('shell');

const buildDerive = require('../derive.at/build.js'),
      buildUrbanize = require('../urbanize.at/build.js'),
      sync = require('../derive-common/sync.js'),
      transform = require('../derive-common/transform.js');

const SuggestionProvider = require('./suggestion-provider.js');

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
  errors: [],
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
  tags: {},
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
    fastMode: {
      default: true,
      description: 'Reduziert den Grad der Parallelisierung beim Generieren der Website - stabiler aber langsamer.',
      title: 'Stabilitätsmodus',
      type: 'boolean'
    }
  },
  subscriptions: null,
  activate() {
    const commands = {
      'derive-beta:deploy-derive.at': () => this.build('derive.at', true),
      'derive-beta:deploy-staging.derive.at': () => this.build('staging.derive.at'),
      'derive-beta:deploy-urbanize.at': () => this.build('urbanize.at', true),
      'derive-beta:deploy-staging.urbanize.at': () => this.build('staging.urbanize.at'),
      'derive-beta:deploy-berlin.urbanize.at': () => this.build('berlin.urbanize.at', true),
      'derive-beta:deploy-staging.berlin.urbanize.at': () => this.build('staging.berlin.urbanize.at'),
      'derive-beta:list-tags': () => this.listTags(),
      'derive-beta:markdown-reference': () => this.markdownReference(),
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
      atom.commands.add('atom-workspace', commands)
    )

    const init = () => {
      atom.workspace.observeTextEditors(editor => {
        editor.onDidSave(() => {
          if(editor.getPath().includes(data.root)) {
            this.refresh(editor.getPath().replace(data.root, ''));
          }
        });
      });

      this.refresh();
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
  },
  deactivate() {
    this.subscriptions.dispose();
  },
  async build(site, confirm = false) {
    const perform = async () => {
      atom.notifications.addInfo(`**${site}**\n\n Seite wird generiert, je nach Computer dauert das in etwa 10-20 Sekunden.`, { icon: 'issue-reopened' });

      if(site.match(/derive\.at/)) {
        await buildDerive(data);
      } else if(site.match(/berlin\.urbanize\.at/)) {
        await buildUrbanize(data, 'berlin');
      } else if(site.match(/urbanize\.at/)) {
        await buildUrbanize(data, 'wien');
      }

      atom.notifications.addSuccess(`**${site}**\n\n Seite erfolgreich generiert!  Starte sync `, { icon: 'issue-reopened' });
      atom.notifications.addInfo(`**${site}**\n\n Die neuen Dateien werden hochgeladen, je nach Verbindung dauert das in etwa 5-20 Sekunden.`, { icon: 'issue-reopened' });

      await sync(data, site);

      atom.notifications.addSuccess(
        `**${site}**\n\n Die Seite wurde erfolgreich aktualisiert!`,
        {
          buttons: [{
            onDidClick: () => shell.openExternal(`https://${site.replace(/\.at$/, '.fdpl.io')}`),
            text: 'Im Browser öffnen'
          }],
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
  async refresh(file) {
    // TODO: Make use of markdown in notification titles!!
    atom.notifications.addInfo(`**derive**\n\nDaten werden aktualisiert, je nach Computer dauert das in etwa 10-60 Sekunden.`, { icon: 'issue-reopened' });
    await transform(data, file);
    atom.notifications.addSuccess('Daten aktualisiert!', { icon: 'issue-closed' });
  },
  async newTemplate(template) {
    const editor = await atom.workspace.open();

    const templatePath = path.join(__dirname, `../templates/${template}.toml`);
    const templateText = fs.readFileSync(templatePath, 'utf-8');

    editor.insertText(templateText);
    editor.setGrammar(atom.grammars.grammarForScopeName('source.toml'));
  },
  async listTags() {
    const editor = await atom.workspace.open(null, { split: 'right' });

    const templatePath = path.join(__dirname, '../templates/article.toml');
    const template = fs.readFileSync(templatePath, 'utf-8');

    editor.insertText(Object.keys(data.tags).sort().join('\n'));
  },
  async markdownReference() {
    const editor = await atom.workspace.open(null, { split: 'right' });

    const referencePath = path.join(__dirname, '../reference/markdown.md');
    const reference = fs.readFileSync(referencePath, 'utf-8');

    editor.insertText(reference);

    const markdownGrammar = atom.grammars.grammarForScopeName('text.md') ||
                            atom.grammars.grammarForScopeName('source.gfm') ||
                            atom.grammars.grammarForScopeName('text.plain');

    editor.setGrammar(markdownGrammar);
  },
  getProvider() {
    // return a single provider, or an array of providers to use together
    return new SuggestionProvider(data);
  }
};
