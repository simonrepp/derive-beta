const connectBooks = (data, collection, field, backReferenceField) => {
  data[collection].forEach(document => {
    document[field].connected = [];
    document[field].sourced.forEach(title => {
      const instance = data.booksByTitle.get(title);

      if(instance) {
        document[field].connected.push(instance);
        instance[backReferenceField].push(document);
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zwischen Buchbesprechung und Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${document.sourceFile}`,
          detail: `Im Artikel "${document.title}" wird das Buch "${title}" besprochen, allerdings wurde in der Datenbank kein Buch mit diesem Titel gefunden.`,
          files: [{ path: document.sourceFile }],
          message: 'Problem gefunden beim prüfen der Verlinkung einer Buchbesprechung mit einem besprochenen Buch'
        });
      }
    });
  });
};

const connectPlayers = (data, collection, field, backReferenceField) => {
  data[collection].forEach(document => {
    document[field].connected = [];
    document[field].sourced.forEach(name => {
      const instance = data.playersByName.get(name);

      if(instance) {
        document[field].connected.push(instance);
        instance[backReferenceField].push(document);
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zum verlinkten Akteur nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${document.sourceFile}`,
          detail: `Die AkteurIn "${name}", angegeben als ${field} in einem Dokument vom Typ ${collection} wurde nicht gefunden.`,
          files: [{ path: document.sourceFile }],
          message: 'Problem gefunden beim prüfen der Verlinkung zu einem Akteur'
        });
      }
    });
  });
};

const clearBackReferences = data => {
  data.books.forEach(book => {
    book.reviews = [];
  });

  data.players.forEach(player => {
    player.articles = [];
    player.authoredBooks = [];
    player.publishedBooks = [];
    player.hostedEvents = [];
    player.eventParticipations = [];
    player.programs = [];
  });
};

const connectIssuesWithArticles = data => {
  data.issues.forEach(issue => {
    issue.sections.forEach(section => {
      section.articles.connected = [];

      section.articles.sourced.forEach(article => {
        const articleInstance = data.articlesByTitle.get(article.title);

        if(articleInstance) {
          section.articles.connected.push(articleInstance);

          articleInstance.issue = issue;
          articleInstance.inIssueOnPages = article.pages;
        } else {
          data.warnings.push({
            description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zum referenzierten Artikel nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${issue.sourceFile}`,
            detail: '',
            files: [{ path: issue.sourceFile }],
            message: `**${issue.sourceFile}**\n\nIn Zeitschrift N° ${issue.number} wird in der Rubrik "${section.title}" der Artikel "${article.title}" referenziert, es wurde aber kein Artikel mit diesem Titel gefunden.`
          });
        }
      });
    });
  });
};

const connectRadioEditors = data => {
  if(data.radio) {
    data.radio.editors.connected = [];
    data.radio.editors.sourced.forEach(name => {
      const instance = data.playersByName.get(name);

      if(instance) {
        data.radio.editors.connected.push(instance);
      } else {
        data.errors.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zum verlinkten Akteur nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${data.radio.sourceFile}`,
          files: [{ path: data.radio.sourceFile }],
          message: `**Radio**\n\nDie AkteurIn "${name}", angegeben als Teil der allgemeinen Radio Redaktion, wurde nicht gefunden.`
        });
      }
    });
  }
};

module.exports = data => {
  clearBackReferences(data);

  connectBooks(data, 'articles', 'bookReviews', 'reviews');

  connectPlayers(data, 'articles', 'authors', 'articles');
  connectPlayers(data, 'books', 'authors', 'authoredBooks');
  connectPlayers(data, 'books', 'publishers', 'publishedBooks');
  connectPlayers(data, 'events', 'hosts', 'hostedEvents');
  connectPlayers(data, 'events', 'participants', 'eventParticipations');
  connectPlayers(data, 'programs', 'editors', 'programs');

  connectIssuesWithArticles(data);

  connectRadioEditors(data);

  return;
};
