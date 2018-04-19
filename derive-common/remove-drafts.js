module.exports = data => {
  data.articles.forEach(article => {
    if(article.draft) {
      data.articles.delete(article.sourceFile);
      data.articlesByPermalink.delete(article.permalink);
      data.articlesByTitle.delete(article.title);
    }
  });

  data.books.forEach(book => {
    if(book.draft) {
      data.books.delete(book.sourceFile);
      data.booksByPermalink.delete(book.permalink);
      data.booksByTitle.delete(book.title);
    }
  });

  data.eventsByPermalink.clear();
  data.events.forEach(event => {
    if(event.draft) {
      data.events.delete(event.sourceFile);
      data.eventsByPermalink.delete(event.permalink);
    }
  });

  data.features.forEach(feature => {
    if(feature.draft) {
      data.features.delete(feature.sourceFile);
    }
  });

  data.issuesByNumber.clear();
  data.issues.forEach(issue => {
    if(issue.draft) {
      data.issues.delete(issue.sourceFile);
      data.issuesByNumber.delete(issue.number);
    }
  });

  data.pagesByPermalink.clear();
  data.pages.forEach(page => {
    if(page.draft) {
      data.pages.delete(page.sourceFile);
      data.pagesByPermalink.delete(page.permalink);
    }
  });

  data.playersByName.clear();
  data.playersByPermalink.clear();
  data.players.forEach(player => {
    if(player.draft) {
      data.players.delete(player.sourceFile);
      data.playersByName.delete(player.name);
      data.playersByPermalink.delete(player.permalink);
    }
  });

  data.programsByPermalink.clear();
  data.programs.forEach(program => {
    if(program.draft) {
      data.programs.delete(program.sourceFile);
      data.programsByPermalink.delete(program.permalink);
    }
  });
};
