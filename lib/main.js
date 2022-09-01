    const commands = {
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
      'derive-beta:screening-reference': () => this.openReference('screening.eno', 'Kino Termin Spezifikation.eno'),
      'derive-beta:new-article': () => this.newTemplate('article.eno'),
      'derive-beta:new-book': () => this.newTemplate('book.eno'),
      'derive-beta:new-event': () => this.newTemplate('event.eno'),
      'derive-beta:new-feature': () => this.newTemplate('feature.eno'),
      'derive-beta:new-issue': () => this.newTemplate('issue.eno'),
      'derive-beta:new-page': () => this.newTemplate('page.eno'),
      'derive-beta:new-player': () => this.newTemplate('player.eno'),
      'derive-beta:new-program': () => this.newTemplate('program.eno'),
      'derive-beta:new-screening': () => this.newTemplate('screening.eno'),
      'derive-beta:toggle-panel': () => this.togglePanel()
    };

    serve(this.data);
  },

  deactivate() {
    if(this.data.server) { this.data.server.close(); }
    if(this.data.syncProcess) { this.data.syncProcess.kill(); }
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
};
