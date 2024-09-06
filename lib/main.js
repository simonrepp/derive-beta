const { CompositeDisposable, Disposable } = require('atom');
const fs = require('fs');
const { configure, observable, observe, transaction } = require('mobx');
const remote = require('remote');
const path = require('path');
const shell = require('shell');

const DeriveDocumentationView = require('./derive-documentation-view.js');
const list = require('./list.js');
const { loadEno } = require('../derive-common/util.js');
const menu = require('./menu');
const preview = require('./preview.js');
const serve = require('./serve.js');
const SuggestionProvider = require('./suggestion-provider.js');
const transform = require('../derive-common/transform.js');
const update = require('./update.js');

module.exports = {
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
    features: new Map(),
    festival: null,
    issues: new Map(),
    media: new Map(),
    pages: new Map(),
    pending: observable({
      action: null,
      details: null
    }),
    players: new Map(),
    programs: new Map(),
    programsPaginated: [],
    publishers: [],
    readableArticles: [],
    tags: new Map(),
    urbanize: {},
    warnings: []
  },

  subscriptions: null,

  async activate() {
    atom.config.set('whitespace.removeTrailingWhitespace', false, { scopeSelector: '.text.eno' });

    const register = async changePathSubscription => {
      const projectFolders = atom.project.getPaths();

      for(let directory of projectFolders) {
        const configPath = path.join(directory, 'derive.eno');

        if(fs.existsSync(configPath)) {
          const config = await loadEno(directory, 'derive.eno');
          const result = {};

          for(const siteSection of config.sections()) {
            const domain = siteSection.stringKey();

            if(domain === 'defaults') {
              siteSection.touch();
              continue;
            }

            result[domain] = {
              directory: siteSection.field('directory').requiredStringValue(),
              host: siteSection.field('host').requiredStringValue(),
              user: siteSection.field('user').requiredStringValue()
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
      'derive-beta:deploy-derive.at': () => update(this.data, 'derive.at', true),
      'derive-beta:deploy-urbanize.at': () => update(this.data, 'urbanize.at', true),
      'derive-beta:deploy-staging.derive.at': () => update(this.data, 'staging.derive.at'),
      'derive-beta:deploy-staging.urbanize.at': () => update(this.data, 'staging.urbanize.at'),
      'derive-beta:preview-derive.at': () => preview(this.data, 'derive.at'),
      'derive-beta:preview-urbanize.at': () => preview(this.data, 'urbanize.at'),
      'derive-beta:list-articles': () => list(this.data, 'articles', 'Artikel Auflistung.txt'),
      'derive-beta:list-books': () => list(this.data, 'books', 'Bücher Auflistung.txt'),
      'derive-beta:list-events': () => list(this.data, 'events', 'Veranstaltungen Auflistung.txt'),
      'derive-beta:list-features': () => list(this.data, 'features', 'Feature Auflistung.txt'),
      'derive-beta:list-issues': () => list(this.data, 'issues', 'Zeitschriften Auflistung.txt'),
      'derive-beta:list-pages': () => list(this.data, 'pages', 'Seiten Auflistung.txt'),
      'derive-beta:list-players': () => list(this.data, 'players', 'Akteur Auflistung.txt'),
      'derive-beta:list-programs': () => list(this.data, 'programs', 'Radiosendungen Auflistung.txt'),
      'derive-beta:list-categories': () => list(this.data, 'categories', 'Kategorien Auflistung.txt'),
      'derive-beta:list-tags': () => list(this.data, 'tags', 'Tag Auflistung.txt'),
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
          return new DeriveDocumentationView(this.data);
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

    observe(this.data.pending, 'action', change => {
      if(change.newValue === null && this.data.pending.delayedRefresh) {
        this.refresh(this.data.pending.delayedRefresh);
      }
    });

    serve(this.data);

    atom.menu.add(menu);
  },

  togglePanel() {
    atom.workspace.toggle('atom://derive-documentation');
  },

  deactivate() {
    if(this.data.server) { this.data.server.close(); }
    if(this.data.syncProcess) { this.data.syncProcess.kill(); }
    if(this.subscriptions) { this.subscriptions.dispose(); }
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

  async refresh(delayed) {
    if(this.data.pending.action) {
      this.data.pending.delayedRefresh = Date.now();
      return;
    }

    transaction(() => {
      this.data.pending.action = 'Daten werden aktualisiert';
      this.data.pending.details = null;
    })

    await transform(this.data);

    if(this.data.errors.length > 0 || this.data.warnings.length > 0) {
      atom.workspace.open('atom://derive-documentation');
    } else {
      atom.notifications.addSuccess(
        '**dérive**\n\nDaten aktualisiert, keine Probleme gefunden!',
        { icon: 'issue-closed' }
      );
    }

    transaction(() => {
      if(delayed && this.data.pending.delayedRefresh === delayed) {
        this.data.pending.delayedRefresh = null;
      }
      this.data.pending.action = null;
    });
  },

  async newTemplate(document) {
    const editor = await atom.workspace.open();

    const templatePath = path.join(__dirname, `../templates/${document}`);
    const templateText = fs.readFileSync(templatePath, 'utf-8');

    editor.setText(templateText);
    editor.setGrammar(atom.grammars.grammarForScopeName('text.eno'));
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
