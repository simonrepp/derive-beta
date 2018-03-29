const fs = require('fs'),
      path = require('path');

class DeriveDocumentationView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('active-editor-info');
    this.element.classList.add('active-editor-info');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The ActiveEditorInfo package is Alive! It\'s ALIVE!';
    message.classList.add('padded');
    this.element.appendChild(message);

    this.subscriptions = atom.workspace.getCenter().observeActivePaneItem(item => {
      if (!atom.workspace.isTextEditor(item)) return;

      if(item.getPath().match(/\/Akteure\//)) {
        const type = 'player';
        const templatePath = path.join(__dirname, `../reference/${type}.html`);
        const templateText = fs.readFileSync(templatePath, 'utf-8');

        message.innerHTML = templateText;
      }

      // message.innerHTML = `
      //   <h2>${item.getFileName() || 'untitled'}</h2>
      //   <ul>
      //     <li><b>Path:</b> ${item.getPath()}</li>
      //     <li><b>Soft Wrap:</b> ${item.softWrapped}</li>
      //     <li><b>Tab Length:</b> ${item.getTabLength()}</li>
      //     <li><b>Encoding:</b> ${item.getEncoding()}</li>
      //     <li><b>Line Count:</b> ${item.getLineCount()}</li>
      //   </ul>
      // `;
    });
  }

  getTitle() {
    return 'Derive Web Handbuch';
  }

  getDefaultLocation() {
    return 'right';
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    return 'atom://derive-documentation'
  }

  serialize() {
    return {
      deserializer: 'derive-beta/DeriveDocumentationView'
    };
  }

  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }
}

module.exports = DeriveDocumentationView;
