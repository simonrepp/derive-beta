module.exports = data => {
  data.articlesByPermalink.clear();
  data.articlesByTitle.clear();
  data.articles.forEach(article => {
    let existingArticle = data.articlesByTitle.get(article.title);

    if(existingArticle) {
      const existingError = existingArticle.titleMeta.error();
      const discardedError = article.titleMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingArticle.sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        files: [
          { label: 'A', path: existingArticle.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: article.sourceFile, ranges: discardedError.ranges }
        ],
        message: `Es existieren zwei Artikel mit dem Titel "${article.title}"`,
        snippet: discardedError.snippet
      });


      data.articles.delete(article.sourceFile);
      return;
    }

    existingArticle = data.articlesByPermalink.get(article.permalink);

    if(existingArticle) {
      const existingError = existingArticle.permalinkMeta.error();
      const discardedError = article.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingArticle.sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        files: [
          { label: 'A', path: existingArticle.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: article.sourceFile, ranges: discardedError.ranges }
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
      const existingError = existingBook.titleMeta.error();
      const discardedError = book.titleMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eines der Bücher auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingBook.sourceFile}\n\n**B (wird verworfen)** - ${book.sourceFile}`,
        files: [
          { label: 'A', path: existingBook.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: book.sourceFile, ranges: discardedError.ranges }
        ],
        message: `Es existieren zwei Bücher mit dem Titel "${book.title}"`,
        snippet: discardedError.snippet
      });

      data.books.delete(book.sourceFile);
      return;
    }

    existingBook = data.booksByPermalink.get(book.permalink);

    if(existingBook) {
      const existingError = existingBook.permalinkMeta.error();
      const discardedError = book.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eines der Bücher auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingBook.sourceFile}\n\n**B (wird verworfen)** - ${book.sourceFile}`,
        files: [
          { label: 'A', path: existingBook.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: book.sourceFile, ranges: discardedError.ranges }
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
      const existingError = existingEvent.permalinkMeta.error();
      const discardedError = event.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Veranstaltungen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingEvent.sourceFile}\n\n**B (wird verworfen)** - ${event.sourceFile}`,
        files: [
          { label: 'A', path: existingEvent.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: event.sourceFile, ranges: discardedError.ranges }
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
      const existingError = existingIssue.numberMeta.error();
      const discardedError = issue.numberMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Zeitschriften auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingIssue.sourceFile}\n\n**B (wird verworfen)** - ${issue.sourceFile}`,
        files: [
          { label: 'A', path: existingIssue.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: issue.sourceFile, ranges: discardedError.ranges }
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
      const existingError = existingPlayer.nameMeta.error();
      const discardedError = player.nameMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der AkteurInnen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingPlayer.sourceFile}\n\n**B (wird verworfen)** - ${player.sourceFile}`,
        files: [
          { label: 'A', path: existingPlayer.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: player.sourceFile, ranges: discardedError.ranges }
        ],
        message: `Es existieren zwei Akteure mit dem Namen "${player.name}"`,
        snippet: discardedError.snippet
      });

      data.players.delete(player.sourceFile);
      return;
    }

    existingPlayer = data.playersByPermalink.get(player.permalink);

    if(existingPlayer) {
      const existingError = existingPlayer.permalinkMeta.error();
      const discardedError = player.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der AkteurInnen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingPlayer.sourceFile}\n\n**B (wird verworfen)** - ${player.sourceFile}`,
        files: [
          { label: 'A', path: existingPlayer.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: player.sourceFile, ranges: discardedError.ranges }
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
      const existingError = existingPage.permalinkMeta.error();
      const discardedError = page.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Seiten auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingPage.sourceFile}\n\n**B (wird verworfen)** - ${page.sourceFile}`,
        files: [
          { label: 'A', path: existingPage.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: page.sourceFile, ranges: discardedError.ranges }
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
    existingProgram = data.programsByPermalink.get(program.permalink);

    if(existingProgram) {
      const existingError = existingProgram.permalinkMeta.error();
      const discardedError = program.permalinkMeta.error();

      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Radiosendungen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${existingProgram.sourceFile}\n\n**B (wird verworfen)** - ${program.sourceFile}`,
        files: [
          { label: 'A', path: existingProgram.sourceFile, ranges: existingError.ranges },
          { label: 'B', path: program.sourceFile, ranges: discardedError.ranges }
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
