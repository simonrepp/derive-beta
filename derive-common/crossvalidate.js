module.exports = data => {
  const articlesByPermalink = new Map();
  data.articlesByTitle = new Map();
  data.articles.forEach(article => {
    let existingArticle = data.articlesByTitle.get(article.title);

    if(existingArticle) {
      const existingError = existingArticle.titleField.valueError();
      const discardedError = article.titleField.valueError();

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

    existingArticle = articlesByPermalink.get(article.permalink);

    if(existingArticle) {
      const existingError = existingArticle.permalinkField.valueError();
      const discardedError = article.permalinkField.valueError();

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

    articlesByPermalink.set(article.permalink, article);
    data.articlesByTitle.set(article.title, article);
  });

  const booksByPermalink = new Map();
  data.booksByTitle = new Map();
  data.books.forEach(book => {
    let existingBook = data.booksByTitle.get(book.title);

    if(existingBook) {
      const existingError = existingBook.titleField.valueError();
      const discardedError = book.titleField.valueError();

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

    existingBook = booksByPermalink.get(book.permalink);

    if(existingBook) {
      const existingError = existingBook.permalinkField.valueError();
      const discardedError = book.permalinkField.valueError();

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

    booksByPermalink.set(book.permalink, book);
    data.booksByTitle.set(book.title, book);
  });

  const eventsByPermalink = new Map();
  data.events.forEach(event => {
    const existingEvent = eventsByPermalink.get(event.permalink);

    if(existingEvent) {
      const existingError = existingEvent.permalinkField.valueError();
      const discardedError = event.permalinkField.valueError();

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
      eventsByPermalink.set(event.permalink, event);
    }
  });

  const issuesByNumber = new Map();
  data.issues.forEach(issue => {
    const existingIssue = issuesByNumber.get(issue.number);

    if(existingIssue) {
      const existingError = existingIssue.numberField.valueError();
      const discardedError = issue.numberField.valueError();

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
      issuesByNumber.set(issue.number, issue);
    }
  });

  data.playersByName = new Map();
  const playersByPermalink = new Map();
  data.players.forEach(player => {
    let existingPlayer = data.playersByName.get(player.name);

    if(existingPlayer) {
      const existingError = existingPlayer.nameField.valueError();
      const discardedError = player.nameField.valueError();

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

    existingPlayer = playersByPermalink.get(player.permalink);

    if(existingPlayer) {
      const existingError = existingPlayer.permalinkField.valueError();
      const discardedError = player.permalinkField.valueError();

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
    playersByPermalink.set(player.permalink, player);
  });

  const pagesByPermalink = new Map();
  data.pages.forEach(page => {
    const contextualizedPermalink = `${page.urbanize || 'derive'}-${page.permalink}`;
    const existingPage = pagesByPermalink.get(contextualizedPermalink);

    if(existingPage) {
      const existingError = existingPage.permalinkField.valueError();
      const discardedError = page.permalinkField.valueError();

      data.warnings.push({
        files: [
          { path: existingPage.sourceFile, selection: existingError.selection },
          { path: page.sourceFile, selection: discardedError.selection }
        ],
        message: `Es existieren zwei Seiten mit dem Permalink "${page.permalink}" im selben Kontext (z.b. für das selbe Urbanize Festival)`,
        snippet: discardedError.snippet
      });

      data.pages.delete(page.sourceFile);
    } else {
      pagesByPermalink.set(contextualizedPermalink, page);
    }
  });

  const programsByPermalink = new Map();
  data.programs.forEach(program => {
    const existingProgram = programsByPermalink.get(program.permalink);

    if(existingProgram) {
      const existingError = existingProgram.permalinkField.valueError();
      const discardedError = program.permalinkField.valueError();

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
      programsByPermalink.set(program.permalink, program);
    }
  });
};
