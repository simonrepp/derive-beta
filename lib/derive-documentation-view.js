const eno = require('enojs');
const { EnoValue } = require('enojs');
const fs = require('fs');
const path = require('path');

const { renderMarkdown } = require('../derive-common/util.js');

class DeriveDocumentationView {

  constructor(data, emitter) {
    this.data = data;

    // Create root element
    this.element = document.createElement('atom-panel');
    this.element.classList.add('padded');

    this.element.addEventListener('click', event => {
      const element = event.target;

      if(element.dataset.openFile !== undefined) {
        const filePath = element.dataset.path;
        const selection = element.dataset.selection;

        atom.workspace.open(filePath).then(editor => {
          if(selection) {
            const parsed = JSON.parse(selection);

            editor.setSelectedBufferRange(
              [[parsed[0][0] - 1, parsed[0][1]],
               [parsed[1][0] - 1, parsed[1][1]]]
            );
          }
        });
      }

      if(element.dataset.showTab !== undefined) {
        const tabToggles = document.querySelectorAll('button[data-show-tab]');
        for(let toggle of tabToggles) {
          if(toggle === element) {
            toggle.classList.add('selected');
          } else {
            toggle.classList.remove('selected');
          }
        }

        const tabs = document.querySelectorAll('div[data-tab-id]');
        for(let tab of tabs) {
          if(tab.dataset.tabId === element.dataset.showTab) {
            tab.style.setProperty('display', 'block');
          } else {
            tab.style.setProperty('display', 'none');
          }
        }
      }
    });

    // Create info element
    this.info = document.createElement('div');
    this.info.style.setProperty('display', 'flex');
    this.info.style.setProperty('align-items', 'center');
    this.info.style.setProperty('justify-content', 'center');
    this.info.style.setProperty('height', '50px');
    this.element.appendChild(this.info);

    const menu = document.createElement('div');
    menu.style.setProperty('display', 'flex');
    menu.style.setProperty('justify-content', 'center');
    menu.style.setProperty('height', '50px');
    menu.innerHTML = `
      <div class="block">
        <div class="btn-group" style="display: flex; justify-content: center;">
          <button class="btn selected" data-show-tab="errors-tab">Fehlerliste</button>
          <button class="btn" data-show-tab="preview-tab">Markdownvorschau</button>
        </div>
      </div>
    `;
    this.element.appendChild(menu);

    // Create preview element
    this.preview = document.createElement('div');
    this.preview.dataset.tabId = 'preview-tab';
    this.preview.classList.add('block');
    this.preview.style.setProperty('display', 'none');
    this.preview.style.setProperty('max-height', 'calc(100% - 100px)');
    this.preview.style.setProperty('overflow', 'scroll');
    this.preview.innerHTML = '<p style="text-align:center;">Die Markdownvorschau aktiviert sich beim schreiben innerhalb eines mehrzeiligen Textfelds.</p>';
    this.element.appendChild(this.preview);

    // Create errors element
    this.errors = document.createElement('div');
    this.errors.dataset.tabId = 'errors-tab';
    this.errors.style.setProperty('max-height', 'calc(100% - 100px)');
    this.errors.style.setProperty('overflow', 'scroll');
    this.element.appendChild(this.errors);

    this.refreshInfo();
    this.refreshErrorList();

    emitter.on('refresh', () => {
      this.refreshInfo();
      this.refreshErrorList();
    });

    this.registerEditor(atom.workspace.getCenter());
    this.paneSubscription = atom.workspace.getCenter().observeActivePaneItem(item => this.registerEditor(item));
  }

  getTitle() {
    return 'dérive Dashboard';
  }

  getDefaultLocation() {
    return 'right';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getURI() {
    return 'atom://derive-documentation';
  }

  refreshInfo() {
    if(this.data.refreshing) {
      this.info.innerHTML = `
        <span class='loading loading-spinner-tiny inline-block'></span>&nbsp;Daten werden aktualisiert
      `;
    } else if(this.data.errors.length > 0 || this.data.warnings.length > 0) {
      this.info.innerHTML = `
        <div class="block" style="display: flex; justify-content: center;">
          ${this.data.errors.length > 0 ? `
            <h2 class="inline-block">
              <span class="icon icon-flame"></span> ${this.data.errors.length} kritische Fehler
            </h2>
          `:''}
          ${this.data.warnings.length > 0 ? `
            <h2 class="inline-block">
              <span class="icon icon-issue-opened"></span> ${this.data.warnings.length} Fehler
            </h2>
          `:''}
        </div>
      `;
    }
  }

  refreshErrorList() {
    let errs = '';

    const printError = error => {
      let description, msg;

      if(error.files) {
        msg = `${error.files.map(file => path.basename(file.path)).join(' &lt;-&gt; ')}`;
      } else {
        msg = 'Fehler';
      }

      errs += `
        <div class="inset-panel derive-panel-warning">
          <div class="panel-heading">
            <span class="icon icon-issue-opened"></span> ${msg}
          </div>
          <div class="panel-body padded">
      `;
      errs += `
        <div class="block">
          ${error.message}
        </div>
      `;

      if(error.snippet) {
        errs += `
          <div class="block">
            ${error.snippet}
          </div>
        `;
      }

      if(error.files) {
        for(let file of error.files) {
          errs += `
            <div class="block">
              <button class="btn btn-primary icon icon-file inline-block-tight"
                      data-open-file
                      data-path="${path.join(this.data.root, file.path)}"
                      ${file.selection ? `data-selection="${JSON.stringify(file.selection)}"` : ''}>
                Datei öffnen
              </button>

              <strong class="inline-block-tight">${file.path}</strong>
            </div>
          `;
        }
      }

      errs += `
          </div>
        </div>
        <br/>
      `;
    };

    for(let error of this.data.errors) {
      printError(error);
    }

    for(let warning of this.data.warnings) {
      printError(warning);
    }

    this.errors.innerHTML = errs;
  }

  registerEditor(item) {
    if (!atom.workspace.isTextEditor(item))
      return;

    if(this.editorSubscription) {
      this.editorSubscription.dispose();
    }

    this.editorSubscription = item.onDidStopChanging(() => {
      try {
        const doc = eno.parse(item.getText());
        const bufferPosition = item.getCursorBufferPosition();
        const lookup = doc.lookup(bufferPosition.row + 1, bufferPosition.column);

        if(lookup && lookup.zone === 'content' && (lookup.element instanceof EnoValue)) {
          const element = lookup.element;
          const value = element.value();

          if(value && value.length > 1) {
            this.preview.innerHTML = renderMarkdown(value);
          }
        } else {
          this.preview.innerHTML = 'Die Markdownvorschau ist nur aktiv wenn in einem mehrzeiligen Textfeld geschrieben wird.';
        }
      } catch(err) {
        // ok to ignore
      }
    });
  }

  destroy() {
    this.element.remove();
    if(this.editorSubscription) { this.editorSubscription.dispose(); }
    if(this.paneSubscription) { this.paneSubscription.dispose(); }
  }

  getElement() {
    return this.element;
  }
}

module.exports = DeriveDocumentationView;
