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

  for(let localFilesystemPath of globPaths) {
    const normalizedPath = localFilesystemPath.normalize();

    if(normalizedPath.match(forbiddenFilenameCharacters)) {

      data.warnings.push({
        description: 'Bis der Dateiname korrigiert wurde wird die Datei ignoriert, dies kann auch weitere Dateien betreffen wenn diese auf die Datei bzw. deren Inhalte referenzieren.',
        detail: 'Lösung: Die nicht erlaubten Zeichen sollten entfernt bzw. durch Leerzeichen oder alternative Zeichen wie "_" oder "-" ersetzt werden.',
        files: [{ path: localFilesystemPath }],
        header: `**${normalizedPath}**\n\nProblem: Im Namen der Datei bzw. des Ordners wurde eines der nicht erlaubten Zeichen  / \\ ? * : | " < > vorgefunden.`
      });

    } else if(path.extname(normalizedPath) === '.plain') {

      if(normalizedPath.match(/^Akteure\//)) {

        await sourcePlayer(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Bücher\//)) {

        await sourceBook(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Features\//)) {

        await sourceFeature(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Radiosendungen\//)) {

        await sourceProgram(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Seiten\//)) {

        await sourcePage(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Texte\//)) {

        await sourceArticle(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Veranstaltungen\//)) {

        await sourceEvent(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Zeitschrift\//)) {

        await sourceIssue(data, localFilesystemPath);

      }

    } else if(!normalizedPath.match(/^\.|^Dokumentation\//)) {
      const media = {
        localFilesystemPath: localFilesystemPath,
        used: false
      };

      data.media.set(normalizedPath, media);

    }
  }

  return data;
};
