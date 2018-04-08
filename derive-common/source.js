const path = require('path');

const { globFiles } = require('./util.js'),
      sourceArticle = require('./source/article.js'),
      sourceBook = require('./source/book.js'),
      sourceEvent = require('./source/event.js'),
      sourceFeature = require('./source/feature.js'),
      sourceIssue = require('./source/issue.js'),
      sourcePage = require('./source/page.js'),
      sourcePlayer = require('./source/player.js'),
      sourceProgram = require('./source/program.js');

// TODO: Gradually refactor warnings to simpler format?
//       Place of occurrence -> Description and consequences -> Solution -> File/Line/Column Shortcut

const forbiddenFilenameCharacters = /[\\?*:|"<>]/;

module.exports = async data => {
  data.articles.clear();
  data.books.clear();
  data.events.clear();
  data.issues.clear();
  data.media.clear();
  data.pages.clear();
  data.players.clear();
  data.programs.clear();
  data.warnings = [];

  const globPaths = await globFiles(data.root, '**/*');

  for(let filePath of globPaths) {

    if(filePath.match(forbiddenFilenameCharacters)) {

      data.warnings.push({
        description: 'Bis der Dateiname korrigiert wurde wird die Datei ignoriert, dies kann auch weitere Dateien betreffen wenn diese auf die Datei bzw. deren Inhalte referenzieren.',
        detail: 'Lösung: Die nicht erlaubten Zeichen sollten entfernt bzw. durch Leerzeichen oder alternative Zeichen wie "_" oder "-" ersetzt werden.',
        files: [{ path: filePath }],
        header: `**${filePath}**\n\nProblem: Im Namen der Datei bzw. des Ordners wurde eines der nicht erlaubten Zeichen  / \\ ? * : | " < > vorgefunden.`
      });

    } else if(path.extname(filePath) === '.plain') {

      if(filePath.match(/^Akteure\//)) {

        await sourcePlayer(data, filePath);

      } else if(filePath.match(/^Bücher\//)) {

        await sourceBook(data, filePath);

      } else if(filePath.match(/^Features\//)) {

        await sourceFeature(data, filePath);

      } else if(filePath.match(/^Radiosendungen\//)) {

        await sourceProgram(data, filePath);

      } else if(filePath.match(/^Seiten\//)) {

        await sourcePage(data, filePath);

      } else if(filePath.match(/^Texte\//)) {

        await sourceArticle(data, filePath);

      } else if(filePath.match(/^Veranstaltungen\//)) {

        await sourceEvent(data, filePath);

      } else if(filePath.match(/^Zeitschrift\//)) {

        await sourceIssue(data, filePath);

      }

    } else if(!filePath.match(/^\.|^Dokumentation\//)) {

      data.media.set(filePath.normalize(), false); // initially mark as unused

    }
  }

  return data;
};
