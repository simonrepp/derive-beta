'use babel';

const { CompositeDisposable } = require('atom'),
      fs = require('fs'),
      path = require('path');

// const transform = require('../../derive.at/transform.js');

import IntermediateProvider from './intermediate-provider';

const data = {
  errors: [],
  suggestions: {
    articles: [],
    players: [],
    tags: []
  }
};

const refresh = () => {
  const root = atom.config.get('derive-beta.deriveDatabaseRoot');

  if(root) {
    const errorsPath = path.join(root, 'errors.json');
    fs.readFile(errorsPath, 'utf-8', (err, errorsJson) => {
      if(err) {
        console.log(err);
      } else {
        data.errors = JSON.parse(errorsJson);
      }
    });

    const suggestionsPath = path.join(root, 'suggestions.json');
    fs.readFile(suggestionsPath, 'utf-8', (err, suggestionsJson) => {
      if(err) {
        console.log(err);
      } else {
        data.suggestions = JSON.parse(suggestionsJson);
      }
    });
  }
  // suggestions.articles.push('Fanny' + new Date());
};

refresh();
setInterval(refresh, 5000);

export default {
  config: {
    deriveDatabaseRoot: {
      default: '',
      description: 'This should point to the root directory of the derive website database',
      title: 'Derive Database Folder',
      type: 'string'
    }
  },
  subscriptions: null,
  activate() {
    const commands = {
      'derive-beta:build-derive': () => this.build(),
      'derive-beta:deploy-derive': () => this.deploy(),
      'derive-beta:deploy-urbanize': () => this.deployUrbanize(),
      'derive-beta:new-article': () => this.newTemplate('article'),
      'derive-beta:new-event': () => this.newTemplate('event'),
      'derive-beta:new-issue': () => this.newTemplate('issue'),
      'derive-beta:new-page': () => this.newTemplate('page'),
      'derive-beta:new-player': () => this.newTemplate('player'),
      'derive-beta:new-program': () => this.newTemplate('program'),
      'derive-beta:markdown-reference': () => this.markdownReference(),
      'derive-beta:list-tags': () => this.listTags()
    };

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', commands)
    )
  },
  deactivate() {
    this.subscriptions.dispose()
  },
  build() {
    // transform();
  },
  deploy() {
    atom.notifications.addSuccess('derive.at wurde erfolgreich deployed!');

    data.errors.forEach(error => atom.notifications.addWarning(error, { dismissable: true }));
  },
  deployUrbanize() {
    atom.notifications.addWarning('Autor nicht gefunden',
    {
      dismissable: true,
      detail: 'Im Artikel "Polo im Hof" ist "John Doe" als Autor angegeben, im Datenbestand wurde aber niemand mit diesem Namen gefunden.\n\n\nFolgende ähnliche Akteure wurden gefunden, möglicherweise liegt nur ein Tippfehler vor?\n\nJane Doe\nJohn Dorr',
      description: 'Bis zur Lösung des Problems erscheint der Artikel "Polo im Hof" online ohne diesen Autor.'
    });
  },
  newTemplate(template) {
    atom.workspace.open().then(editor => {
      const templatePath = path.join(__dirname, `../templates/${template}.toml`);
      const templateText = fs.readFileSync(templatePath, 'utf-8');

      editor.insertText(templateText);
      editor.setGrammar(atom.grammars.grammarForScopeName('source.toml'));
    });
  },
  listTags() {
    atom.workspace.open().then(editor => {
      const templatePath = path.join(__dirname, '../templates/article.toml');
      const template = fs.readFileSync(templatePath, 'utf-8');

      editor.insertText(data.suggestions.tags.map(tag => tag.text).sort().join('\n'));
    });
  },
  markdownReference() {
    atom.workspace.open().then(editor => {
      const referencePath = path.join(__dirname, '../reference/markdown.md');
      const reference = fs.readFileSync(referencePath, 'utf-8');

      editor.insertText(reference);

      const markdownGrammar = atom.grammars.grammarForScopeName('text.md') ||
                              atom.grammars.grammarForScopeName('source.gfm') ||
                              atom.grammars.grammarForScopeName('text.plain');

      editor.setGrammar(markdownGrammar);
    });
  },
  getProvider() {
    // return a single provider, or an array of providers to use together
    return new IntermediateProvider(data);
  }
};
