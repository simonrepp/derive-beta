module.exports = data => {
  data.articlesByPermalink.clear();
  data.articlesByTitle.clear();
  data.articles.forEach(article => {
    if(data.articlesByTitle.has(article.title)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.articlesByTitle.get(article.title).sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        files: [
          { path: data.articlesByTitle.get(article.title).sourceFile, label: 'A' },
          { path: article.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Artikel mit dem Titel "${article.title}"`
      });


      data.articles.delete(article.sourceFile);
      return;
    }

    if(data.articlesByPermalink.has(article.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.articlesByPermalink.get(article.permalink).sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        files: [
          { path: data.articlesByPermalink.get(article.permalink).sourceFile, label: 'A' },
          { path: article.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Artikel mit dem Permalink "${article.permalink}"`
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
    if(data.booksByTitle.has(book.title)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eines der Bücher auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.booksByTitle.get(book.title).sourceFile}\n\n**B (wird verworfen)** - ${book.sourceFile}`,
        files: [
          { path: data.booksByTitle.get(book.title).sourceFile, label: 'A' },
          { path: book.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Bücher mit dem Titel "${book.title}"`
      });

      data.books.delete(book.sourceFile);
      return;
    }

    if(data.booksByPermalink.has(book.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eines der Bücher auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.booksByPermalink.get(book.permalink).sourceFile}\n\n**B (wird verworfen)** - ${book.sourceFile}`,
        files: [
          { path: data.booksByPermalink.get(book.permalink).sourceFile, label: 'A' },
          { path: book.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Bücher mit dem Permalink "${book.permalink}"`
      });

      data.books.delete(book.sourceFile);
      return;
    }

    data.booksByPermalink.set(book.permalink, book);
    data.booksByTitle.set(book.title, book);
  });

  data.eventsByPermalink.clear();
  data.events.forEach(event => {
    if(data.eventsByPermalink.has(event.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Veranstaltungen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.eventsByPermalink.get(event.permalink).sourceFile}\n\n**B (wird verworfen)** - ${event.sourceFile}`,
        files: [
          { path: data.eventsByPermalink.get(event.permalink).sourceFile, label: 'A' },
          { path: event.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Veranstaltungen mit dem Permalink "${event.permalink}"`
      });

      data.events.delete(event.sourceFile);
    } else {
      data.eventsByPermalink.set(event.permalink, event);
    }
  });

  data.issuesByNumber.clear();
  data.issues.forEach(issue => {
    if(data.issuesByNumber.has(issue.number)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Zeitschriften auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.issuesByNumber.get(issue.number).sourceFile}\n\n**B (wird verworfen)** - ${issue.sourceFile}`,
        files: [
          { path: data.issuesByNumber.get(issue.number).sourceFile, label: 'A' },
          { path: issue.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Zeitschriften mit der Nummer ${issue.number}`
      });

      data.issues.delete(issue.sourceFile);
    } else {
      data.issuesByNumber.set(issue.number, issue);
    }
  });

  data.playersByName.clear();
  data.playersByPermalink.clear();
  data.players.forEach(player => {
    if(data.playersByName.has(player.name)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der AkteurInnen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.playersByName.get(player.name).sourceFile}\n\n**B (wird verworfen)** - ${player.sourceFile}`,
        files: [
          { path: data.playersByName.get(player.name).sourceFile, label: 'A' },
          { path: player.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Akteure mit dem Namen "${player.name}"`
      });

      data.players.delete(player.sourceFile);
      return;
    }

    if(data.playersByPermalink.has(player.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der AkteurInnen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.playersByPermalink.get(player.permalink).sourceFile}\n\n**B (wird verworfen)** - ${player.sourceFile}`,
        files: [
          { path: data.playersByPermalink.get(player.permalink).sourceFile, label: 'A' },
          { path: player.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Akteure mit dem Permalink "${player.permalink}"`
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

    if(data.pagesByPermalink.has(permalinkInContext)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Seiten auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.pagesByPermalink.get(page.permalink).sourceFile}\n\n**B (wird verworfen)** - ${page.sourceFile}`,
        files: [
          { path: data.pagesByPermalink.get(page.permalink).sourceFile, label: 'A' },
          { path: page.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Seiten mit dem Permalink "${page.permalink}" im selben Kontext (z.b. Urbanize Festival)`
      });

      data.pages.delete(page.sourceFile);
    } else {
      data.pagesByPermalink.set(page.permalink, page);
    }
  });

  data.programsByPermalink.clear();
  data.programs.forEach(program => {
    if(data.programsByPermalink.has(program.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der Radiosendungen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.programsByPermalink.get(program.permalink).sourceFile}\n\n**B (wird verworfen)** - ${program.sourceFile}`,
        files: [
          { path: data.programsByPermalink.get(program.permalink).sourceFile, label: 'A' },
          { path: program.sourceFile, label: 'B' }
        ],
        message: `Es existieren zwei Radiosendungen mit dem Permalink "${program.permalink}"`
      });

      data.programs.delete(program.sourceFile);
    } else {
      data.programsByPermalink.set(program.permalink, program);
    }
  });
};
