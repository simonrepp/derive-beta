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
          files: [{ path: document.sourceFile }],
          message: `Im Artikel "${document.title}" wird das Buch "${title}" besprochen, allerdings wurde in der Datenbank kein Buch mit diesem Titel gefunden.`,
          snippet: 'TODO'
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
          files: [{ path: document.sourceFile }],
          message: `Die AkteurIn "${name}", angegeben als ${field} in einem Dokument vom Typ ${collection} wurde nicht gefunden.`,
          snippet: 'TODO'
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
      section.articles = [];
      section.articlesUnconnected.forEach(article => {
        const articleInstance = data.articlesByTitle.get(article.titleLazy.value);

        if(articleInstance) {
          section.articles.push(articleInstance);

          articleInstance.issue = issue;
          articleInstance.inIssueOnPages = article.pages;
        } else {
          const error = article.titleLazy.error(`In Zeitschrift N° ${issue.number} wird in der Rubrik "${section.title}" der Artikel "${article.title}" referenziert, es wurde aber kein Artikel mit diesem Titel gefunden.`);

          data.warnings.push({
            files: [{ path: issue.sourceFile, ranges: error.ranges }],
            message: error.message,
            snippet: error.snippet
          });
        }
      });
    });
  });
};

const connectRadioEditors = data => {
  if(data.radio) {
    data.radio.editors = [];
    data.radio.editorsLazy.forEach(name => {
      const instance = data.playersByName.get(name.value);

      if(instance) {
        data.radio.editors.push(instance);
      } else {
        const error = name.error(`Die AkteurIn "${name.value}", angegeben als Teil der allgemeinen Radio Redaktion, wurde nicht gefunden.`);

        data.errors.push({
          files: [{ path: data.radio.sourceFile, ranges: error.ranges }],
          message: error.message,
          snippet: error.snippet
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
