const path = require('path');

const checkup = require('./checkup.js'),
      connect = require('./connect.js'),
      crossvalidate = require('./crossvalidate.js'),
      expand = require('./expand.js'),
      source = require('./source.js'),
      urbanize = require('./urbanize.js');

module.exports = async (data, file) => {
  await source(data, file); // Read all source files and validate their data
                            // Documents that are not valid are not taken into the system

  crossvalidate(data); // Ensure uniqueness of primary keys before attempting to connect everything
                       // Conflicting documents are removed (the later ones)

  connect(data); // Create relational references between all objects

  expand(data); // Create tags, connected to their referenced objects
                // Create refined collections: authors, bookAuthors, publishers

  urbanize(data); // Create refined collections for current urbanize festival(s)

  checkup(data); // Provide additional warnings for unused media

  if(data.warnings) {
    const first = data.warnings[0];

    [0, 1, 2].forEach(index => {
      if(data.warnings.length >= index + 1) {
        const warning = data.warnings[index];

        atom.notifications.addWarning(
          warning.header,
          {
            buttons: warning.files ? warning.files.map(file => ({
              onDidClick: () => atom.workspace.open(
                path.join(data.root, file.path),
                {
                  initialColumn: file.column || 0,
                  initialLine: file.line || 0
                }
              ),
              text: `${file.label || 'Datei'} öffnen`
            })) : [],
            dismissable: true,
            detail: warning.detail,
            description: warning.description,
            icon: 'issue-opened'
          }
        );
      }
    })

    if(data.warnings.length > 3) {
      atom.notifications.addWarning(
        `Insgesamt wurden ${data.warnings.length - 3} Probleme festgestellt.`,
        {
          buttons: [{
            onDidClick: () => {
              atom.workspace.open().then(editor => {
                const report = data.warnings.map(warning =>
                  `${warning.header}\n${warning.detail}\n${warning.description}\n${warning.files.map(file => file.path).join(', ')}`
                ).join('\n\n------------------------------------------\n\n')

                editor.insertText(report);
              });
            },
            text: 'Komplette Auflistung'
          }],
          dismissable: true,
          detail: 'Bis zur Lösung der Probleme scheinen manche Unterseiten nicht auf, abgesehen davon gibt es keine Auswirkungen.',
          icon: 'issue-opened'
        }
      );
    }
  }

  return data;
};
