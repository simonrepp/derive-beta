const glob = require('fast-glob');
const path = require('path');

const sourceArticle = require('./source/article.js');
const sourceBook = require('./source/book.js');
const sourceFeature = require('./source/feature.js');
const sourceFestival = require('./source/festival.js');
const sourceIssue = require('./source/issue.js');
const sourcePage = require('./source/page.js');
const sourcePlayer = require('./source/player.js');
const sourceProgram = require('./source/program.js');
const sourceScreening = require('./source/screening.js');

const sourceUrbanizeEvent = require('./source/urbanize/event.js');
const sourceUrbanizeHome = require('./source/urbanize/home.js');
const sourceUrbanizePage = require('./source/urbanize/page.js');
const sourceUrbanizeParticipants = require('./source/urbanize/participants.js');

const { URBANIZE_YEAR } = require('../urbanize.at/config.js');

const FORBIDDEN_FILENAME_CHARACTERS = /[\\?*:|"<>]/;
const NO_EXTENSION = /[^.]{8,}\s*$/;

module.exports = async data => {
  data.articles.clear();
  data.books.clear();
  data.features.clear();
  data.issues.clear();
  data.media.clear();
  data.pages.clear();
  data.players.clear();
  data.programs.clear();
  data.urbanize = {
    events: {},
    pages: {},
    participants: []
  };

  data.errors = [];
  data.warnings = [];

  const globPaths = await glob(['**/*', '!Archiv'], { cwd: data.root, onlyFiles: true });

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
      if(normalizedPath === 'Festival/Festival.eno') { await sourceFestival(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Akteure/')) { await sourcePlayer(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Bücher/')) { await sourceBook(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Features/')) { await sourceFeature(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Kino/')) { await sourceScreening(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Radio/')) { await sourceProgram(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Seiten/')) { await sourcePage(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Texte/')) { await sourceArticle(data, localFilesystemPath); } else
      if(normalizedPath.startsWith('Zeitschriften/')) { await sourceIssue(data, localFilesystemPath); } else
      if(normalizedPath.startsWith(`${URBANIZE_YEAR}.urbanize.at/programm/`)) { await sourceUrbanizeEvent(data, localFilesystemPath); } else
      if(normalizedPath === `${URBANIZE_YEAR}.urbanize.at/startseite.eno`) { await sourceUrbanizeHome(data, localFilesystemPath); } else
      if(normalizedPath === `${URBANIZE_YEAR}.urbanize.at/beteiligte.eno`) { await sourceUrbanizeParticipants(data, localFilesystemPath); } else
      if(normalizedPath.startsWith(`${URBANIZE_YEAR}.urbanize.at/`)) { await sourceUrbanizePage(data, localFilesystemPath); }
      else if(normalizedPath !== 'derive.eno') {
        data.warnings.push({
          files: [{ path: localFilesystemPath }],
          message: `Die Datei ${normalizedPath} ist nicht zuordenbar. Sie ist wahrscheinlich entweder vom System (noch) nicht vorgesehen, im falschen Ordner oder ihr Name ist falsch geschrieben.`
        });
      }
    } else {
      data.media.set(normalizedPath, { localFilesystemPath, used: false });
    }
  }

  return data;
};
