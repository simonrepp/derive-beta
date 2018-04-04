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
          header: 'Problem gefunden beim prüfen der Verlinkung einer Buchbesprechung mit einem besprochenen Buch'
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
        // TODO: Better german error reporting (sorta maps the wrong way around)
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zum verlinkten Akteur nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${document.sourceFile}`,
          detail: `Die AkteurIn "${name}", angegeben als ${field} in einem Dokument vom Typ ${collection} wurde nicht gefunden.`,
          files: [{ path: document.sourceFile }],
          header: 'Problem gefunden beim prüfen der Verlinkung zu einem Akteur'
        });
      }
    });
  });
};

// TODO: Have it be .connected on backReferenceFields too, because consistency ... (even though they have no .sourced)

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
    player.partnerships = [];
    player.programs = [];
  });
};

module.exports = data => {
  clearBackReferences(data);

  connectBooks(data, 'articles', 'bookReviews', 'reviews');

  connectPlayers(data, 'articles', 'authors', 'articles');
  connectPlayers(data, 'books', 'authors', 'authoredBooks');
  connectPlayers(data, 'books', 'publishers', 'publishedBooks');
  connectPlayers(data, 'events', 'hosts', 'hostedEvents');
  connectPlayers(data, 'events', 'participants', 'eventParticipations');
  connectPlayers(data, 'issues', 'partners', 'partnerships');
  connectPlayers(data, 'programs', 'editors', 'programs');

  // TODO: issues articles connection
           // Note: article titles might not be unique - maybe combine matching with in_issue_blablabla?..
           // Note: should include the article.issue single connection :) ()
          //        currently this is a two way link , maybe should just be one way (consider sorted sections though etc.)

  return;
};
