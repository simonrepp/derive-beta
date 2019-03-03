const glob = require('fast-glob');
const path = require('path');

const sourceArticle = require('./source/article.js');
const sourceBook = require('./source/book.js');
const sourceEvent = require('./source/event.js');
const sourceFeature = require('./source/feature.js');
const sourceFestival = require('./source/festival.js');
const sourceIssue = require('./source/issue.js');
const sourcePage = require('./source/page.js');
const sourcePlayer = require('./source/player.js');
const sourceProgram = require('./source/program.js');
const sourceScreening = require('./source/screening.js');

const FORBIDDEN_FILENAME_CHARACTERS = /[\\?*:|"<>]/;
const NO_EXTENSION = /[^.]{8,}\s*$/;

module.exports = async data => {
  data.articles.clear();
  data.books.clear();
  data.errors = [];
  data.events.clear();
  data.features.clear();
  data.issues.clear();
  data.media.clear();
  data.pages.clear();
  data.players.clear();
  data.programs.clear();
  data.warnings = [];

  const globPaths = await glob('**/*', { cwd: data.root, onlyFiles: true });

  for(let localFilesystemPath of globPaths) {
    const normalizedPath = localFilesystemPath.normalize();

    if(normalizedPath.match(NO_EXTENSION)) {

      data.warnings.push({
        files: [{ path: localFilesystemPath }],
        message: `Die Datei ${normalizedPath} hat keine Dateiendung.`,
      });

    } else if(normalizedPath.match(FORBIDDEN_FILENAME_CHARACTERS)) {

      data.warnings.push({
        files: [{ path: localFilesystemPath }],
        message: 'Im Namen der Datei bzw. des Ordners wurde eines der nicht erlaubten Zeichen  / \\ ? * : | " < > vorgefunden; Die nicht erlaubten Zeichen sollten entfernt bzw. durch Leerzeichen oder alternative Zeichen wie "_" oder "-" ersetzt werden.',
      });

    } else if(path.extname(normalizedPath) === '.eno') {

      if(normalizedPath === 'Festival/Festival.eno') {

        await sourceFestival(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Akteure\//)) {

        await sourcePlayer(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Bücher\//)) {

        await sourceBook(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Features\//)) {

        await sourceFeature(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Kino\//)) {

        await sourceScreening(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Radio\//)) {

        await sourceProgram(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Seiten\//)) {

        await sourcePage(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Texte\//)) {

        await sourceArticle(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Veranstaltungen\//)) {

        await sourceEvent(data, localFilesystemPath);

      } else if(normalizedPath.match(/^Zeitschriften\//)) {

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
