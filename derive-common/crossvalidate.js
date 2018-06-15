module.exports = data => {
  data.articlesByPermalink.clear();
  data.articlesByTitle.clear();
  data.articles.forEach(article => {
    let existingArticle = data.articlesByTitle.get(article.title);

    if(existingArticle) {
      const existingError = existingArticle.titleElement.error();
      const discardedError = article.titleElement.error();

      data.warnings.push({
        files: [
          { path: existingArticle.sourceFile, selection: existingError.selection },
          { path: article.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Artikel mit dem Titel "${article.title}"`,
        snippet: discardedError.snippet
      });


      data.articles.delete(article.sourceFile);
      return;
    }

    existingArticle = data.articlesByPermalink.get(article.permalink);

    if(existingArticle) {
      const existingError = existingArticle.permalinkElement.error();
      const discardedError = article.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingArticle.sourceFile, selection: existingError.selection },
          { path: article.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Artikel mit dem Permalink "${article.permalink}"`,
        snippet: discardedError.snippet
      });

      data.articles.delete(article.sourceFile);
      return;
    }

    data.articlesByPermalink.set(article.permalink, article);
    data.articlesByTitle.set(article.title, article);
  });

  data.booksByPermalink.clear();
  data.booksByTitle.clear();
  data.books.forEach(book => {
    let existingBook = data.booksByTitle.get(book.title);

    if(existingBook) {
      const existingError = existingBook.titleElement.error();
      const discardedError = book.titleElement.error();

      data.warnings.push({
        files: [
          { path: existingBook.sourceFile, selection: existingError.selection },
          { path: book.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Bücher mit dem Titel "${book.title}"`,
        snippet: discardedError.snippet
      });

      data.books.delete(book.sourceFile);
      return;
    }

    existingBook = data.booksByPermalink.get(book.permalink);

    if(existingBook) {
      const existingError = existingBook.permalinkElement.error();
      const discardedError = book.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingBook.sourceFile, selection: existingError.selection },
          { path: book.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Bücher mit dem Permalink "${book.permalink}"`,
        snippet: discardedError.snippet
      });

      data.books.delete(book.sourceFile);
      return;
    }

    data.booksByPermalink.set(book.permalink, book);
    data.booksByTitle.set(book.title, book);
  });

  data.eventsByPermalink.clear();
  data.events.forEach(event => {
    const existingEvent = data.eventsByPermalink.get(event.permalink);

    if(existingEvent) {
      const existingError = existingEvent.permalinkElement.error();
      const discardedError = event.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingEvent.sourceFile, selection: existingError.selection },
          { path: event.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Veranstaltungen mit dem Permalink "${event.permalink}"`,
        snippet: discardedError.snippet
      });

      data.events.delete(event.sourceFile);
    } else {
      data.eventsByPermalink.set(event.permalink, event);
    }
  });

  data.issuesByNumber.clear();
  data.issues.forEach(issue => {
    const existingIssue = data.issuesByNumber.get(issue.number);

    if(existingIssue) {
      const existingError = existingIssue.numberElement.error();
      const discardedError = issue.numberElement.error();

      data.warnings.push({
        files: [
          { path: existingIssue.sourceFile, selection: existingError.selection },
          { path: issue.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Zeitschriften mit der Nummer ${issue.number}`,
        snippet: discardedError.snippet
      });

      data.issues.delete(issue.sourceFile);
    } else {
      data.issuesByNumber.set(issue.number, issue);
    }
  });

  data.playersByName.clear();
  data.playersByPermalink.clear();
  data.players.forEach(player => {
    let existingPlayer = data.playersByName.get(player.name);

    if(existingPlayer) {
      const existingError = existingPlayer.nameElement.error();
      const discardedError = player.nameElement.error();

      data.warnings.push({
        files: [
          { path: existingPlayer.sourceFile, selection: existingError.selection },
          { path: player.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Akteure mit dem Namen "${player.name}"`,
        snippet: discardedError.snippet
      });

      data.players.delete(player.sourceFile);
      return;
    }

    existingPlayer = data.playersByPermalink.get(player.permalink);

    if(existingPlayer) {
      const existingError = existingPlayer.permalinkElement.error();
      const discardedError = player.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingPlayer.sourceFile, selection: existingError.selection },
          { path: player.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Akteure mit dem Permalink "${player.permalink}"`,
        snippet: discardedError.snippet
      });

      data.players.delete(player.sourceFile);
      return;
    }

    data.playersByName.set(player.name, player);
    data.playersByPermalink.set(player.permalink, player);
  });

  data.pagesByPermalink.clear();
  data.pages.forEach(page => {
    const permalinkInContext = [page.permalink, page.urbanize].filter(Boolean).join('-');
    const existingPage = data.pagesByPermalink.get(permalinkInContext); // TODO: We check for permalink In Context but set permalink without context? Check again

    if(existingPage) {
      const existingError = existingPage.permalinkElement.error();
      const discardedError = page.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingPage.sourceFile, selection: existingError.selection },
          { path: page.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Seiten mit dem Permalink "${page.permalink}" im selben Kontext (z.b. Urbanize Festival)`,
        snippet: discardedError.snippet
      });

      data.pages.delete(page.sourceFile);
    } else {
      data.pagesByPermalink.set(page.permalink, page);
    }
  });

  data.programsByPermalink.clear();
  data.programs.forEach(program => {
    const existingProgram = data.programsByPermalink.get(program.permalink);

    if(existingProgram) {
      const existingError = existingProgram.permalinkElement.error();
      const discardedError = program.permalinkElement.error();

      data.warnings.push({
        files: [
          { path: existingProgram.sourceFile, selection: existingError.selection },
          { path: program.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Radiosendungen mit dem Permalink "${program.permalink}"`,
        snippet: discardedError.snippet
      });

      data.programs.delete(program.sourceFile);
    } else {
      data.programsByPermalink.set(program.permalink, program);
    }
  });
};
