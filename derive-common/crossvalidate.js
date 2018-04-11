module.exports = data => {
  data.articlesByPermalink.clear();
  data.articlesByTitle.clear();
  data.articles.forEach(article => {
    if(data.articlesByTitle.has(article.title)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.articlesByTitle.get(article.title).sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        detail: `Es existieren zwei Artikel mit dem Titel "${article.title}"`,
        files: [
          { path: data.articlesByTitle.get(article.title).sourceFile, label: 'A' },
          { path: article.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Titel aller Artikel'
      });


      data.articles.delete(article.sourceFile);
      return;
    }

    if(data.articlesByPermalink.has(article.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint einer der Artikel auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.articlesByPermalink.get(article.permalink).sourceFile}\n\n**B (wird verworfen)** - ${article.sourceFile}`,
        detail: `Es existieren zwei Artikel mit dem Permalink "${article.permalink}"`,
        files: [
          { path: data.articlesByPermalink.get(article.permalink).sourceFile, label: 'A' },
          { path: article.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Artikel'
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
        detail: `Es existieren zwei Bücher mit dem Titel "${book.title}"`,
        files: [
          { path: data.booksByTitle.get(book.title).sourceFile, label: 'A' },
          { path: book.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Titel aller Bücher'
      });

      data.books.delete(book.sourceFile);
      return;
    }

    if(data.booksByPermalink.has(book.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eines der Bücher auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.booksByPermalink.get(book.permalink).sourceFile}\n\n**B (wird verworfen)** - ${book.sourceFile}`,
        detail: `Es existieren zwei Bücher mit dem Permalink "${book.permalink}"`,
        files: [
          { path: data.booksByPermalink.get(book.permalink).sourceFile, label: 'A' },
          { path: book.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Bücher'
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
        detail: `Es existieren zwei Veranstaltungen mit dem Permalink "${event.permalink}"`,
        files: [
          { path: data.eventsByPermalink.get(event.permalink).sourceFile, label: 'A' },
          { path: event.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Veranstaltungen'
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
        description: `Bis zur Lösung des Problems scheint eine der Ausgaben auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.issuesByNumber.get(issue.number).sourceFile}\n\n**B (wird verworfen)** - ${issue.sourceFile}`,
        detail: `Es existieren zwei Ausgaben mit der Nummer ${issue.number}`,
        files: [
          { path: data.issuesByNumber.get(issue.number).sourceFile, label: 'A' },
          { path: issue.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Nummern aller Ausgaben'
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
        detail: `Es existieren zwei Akteure mit dem Namen "${player.name}"`,
        files: [
          { path: data.playersByName.get(player.name).sourceFile, label: 'A' },
          { path: player.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Namen aller Akteure'
      });

      data.players.delete(player.sourceFile);
      return;
    }

    if(data.playersByPermalink.has(player.permalink)) {
      data.warnings.push({
        description: `Bis zur Lösung des Problems scheint eine der AkteurInnen auf der Website nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**In Konflikt stehende Dateien:**\n\n**A (scheint online auf)** - ${data.playersByPermalink.get(player.permalink).sourceFile}\n\n**B (wird verworfen)** - ${player.sourceFile}`,
        detail: `Es existieren zwei Akteure mit dem Permalink "${player.permalink}"`,
        files: [
          { path: data.playersByPermalink.get(player.permalink).sourceFile, label: 'A' },
          { path: player.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Akteure'
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
        detail: `Es existieren zwei Seiten mit dem Permalink "${page.permalink}" im selben Kontext (z.b. Urbanize Festival)`,
        files: [
          { path: data.pagesByPermalink.get(page.permalink).sourceFile, label: 'A' },
          { path: page.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Seiten'
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
        detail: `Es existieren zwei Radiosendungen mit dem Permalink "${program.permalink}"`,
        files: [
          { path: data.programsByPermalink.get(program.permalink).sourceFile, label: 'A' },
          { path: program.sourceFile, label: 'B' }
        ],
        header: 'Problem beim gegenseitigem prüfen der Permalinks aller Radiosendungen'
      });

      data.programs.delete(program.sourceFile);
    } else {
      data.programsByPermalink.set(program.permalink, program);
    }
  });
};
