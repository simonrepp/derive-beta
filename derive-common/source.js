const path = require('path');

const { globFiles, loadToml } = require('./lib.js'),
      sourceArticle = require('./source/article.js'),
      sourceBook = require('./source/book.js'),
      sourceEvent = require('./source/event.js'),
      sourceIssue = require('./source/issue.js'),
      sourcePage = require('./source/page.js'),
      sourcePlayer = require('./source/player.js'),
      sourceProgram = require('./source/program.js');

// TODO: Copy markdown embeddded images I guess? Phew!! :) CHALLENGE ACCEPTED
// TODO: Enforce required fields where it makes sense
// TODO: When we switch to .plain -> Have fun with umlaute and sonderzeichen in data keys!!! :DD
// TODO: Also .plain relevant: Adapt parse/validation so it handles array fields as single value/empy OR array smoothly

module.exports = async (data, file) => {
  data.warnings = [];

  const tomlPaths = [];

  if(file) {
    tomlPaths.push(file);
  } else {
    const paths = await globFiles(data.root, '**/*');

    data.media.clear();

    paths.forEach(filePath => {
      if(path.extname(filePath) === '.toml') {
        tomlPaths.push(filePath);
      } else {
        data.media.set(filePath, 0)
      }
    })
  }

  // TODO: Reintroduce some async again? :) (in batches of [n] as configured in settings ?)
  for(let i = 0; i < tomlPaths.length; i++) {
    if(tomlPaths[i].match(/^Akteure\//)) {
      await sourcePlayer(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Bücher\//)) {
      await sourceBook(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Radiosendungen\//)) {
      await sourceProgram(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Seiten\//)) {
      await sourcePage(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Texte\//)) {
      await sourceArticle(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Veranstaltungen\//)) {
      await sourceEvent(data, tomlPaths[i]);
    } else if(tomlPaths[i].match(/^Zeitschrift\//)) {
      await sourceIssue(data, tomlPaths[i]);
    }
  }

  return data;
};
