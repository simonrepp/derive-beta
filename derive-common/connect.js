const connectBooks = (data, collection, field, backReferenceField) => {
  data[collection].forEach(document => {
    const titles = document[field];

    const instances = titles.map(title => {
      const instance = data.booksByTitle.get(title);

      if(instance) {
        if(instance[backReferenceField]) {
          instance[backReferenceField].push(document);
        } else {
          instance[backReferenceField] = [document];
        }

        return instance;
      } else {
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zwischen Buchbesprechung und Buch nicht auf der Website auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${document.sourceFile}`,
          detail: `Im Artikel "${collection.title}" wird das Buch "${title}" besprochen, allerdings wurde in der Datenbank kein Buch mit diesem Titel gefunden.`, // TODO: Fuzzy suggestions in case of typos? :)
          files: [{ path: document.sourceFile }],
          header: 'Unkritischer Fehler beim prüfen der Verlinkung einer Buchbesprechung mit einem besprochenen Buch'
        });

        return null;
      }
    });

    document[field] = instances.filter(Boolean);
  });
};

const connectPlayers = (data, collection, field, backReferenceField) => {
  data[collection].forEach(document => {
    const names = document[field];

    const instances = names.map(name => {
      const instance = data.playersByName.get(name);

      if(instance) {
        if(instance[backReferenceField]) {
          instance[backReferenceField].push(document);
        } else {
          instance[backReferenceField] = [document];
        }

        return instance;
      } else {
        // TODO: Better german error reporting (sorta maps the wrong way around)
        data.warnings.push({
          description: `Bis zur Lösung des Problems scheint die betroffene Verbindung zum verlinkten Akteur nicht auf, davon abgesehen hat dieser Fehler keine Auswirkungen.\n\n**Betroffenes File:** ${document.sourceFile}`,
          detail: `Der Akteur "${name}", angegeben als ${field} in einem Dokument vom Typ ${collection} wurde nicht gefunden.`, // TODO: Fuzzy suggestions in case of typos? :)
          files: [{ path: document.sourceFile }],
          header: 'Unkritischer Fehler beim prüfen der Verlinkung zu einem Akteur'
        });

        return null;
      }
    });

    document[field] = instances.filter(Boolean);
  });
};

module.exports = data => {
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
