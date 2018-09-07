module.exports = data => {
  data.articles.forEach(article => {
    if(article.draft) {
      data.articles.delete(article.sourceFile);
    }
  });

  data.books.forEach(book => {
    if(book.draft) {
      data.books.delete(book.sourceFile);
    }
  });

  data.events.forEach(event => {
    if(event.draft) {
      data.events.delete(event.sourceFile);
    }
  });

  data.features.forEach(feature => {
    if(feature.draft) {
      data.features.delete(feature.sourceFile);
    }
  });

  data.issues.forEach(issue => {
    if(issue.draft) {
      data.issues.delete(issue.sourceFile);
    }
  });

  data.pages.forEach(page => {
    if(page.draft) {
      data.pages.delete(page.sourceFile);
    }
  });

  data.players.forEach(player => {
    if(player.draft) {
      data.players.delete(player.sourceFile);
    }
  });

  data.programs.forEach(program => {
    if(program.draft) {
      data.programs.delete(program.sourceFile);
    }
  });
};
