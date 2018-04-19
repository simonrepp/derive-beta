const connectBookReviews = data => {
  data.articles.forEach(article => {
    article.reviewedBooks = [];
    article.reviewedBookReferences.forEach(({ trace, value }) => {
      const book = data.booksByTitle.get(value);

      if(book) {
        article.reviewedBooks.push(book);
        book.reviews.push(document);
      } else {
        const error = trace.error(`Im Artikel "${article.title}" wird das Buch "${value}" besprochen, allerdings wurde kein Buch mit diesem Titel gefunden.`);

        data.warnings.push({
          files: [{ path: article.sourceFile, ranges: error.ranges }],
          message: error.message,
          snippet: error.snippet
        });
      }
    });
  });
};

const connectPlayers = (data, collection, referencesField, instancesField, backReferenceField) => {
  data[collection].forEach(document => {
    document[instancesField] = [];
    document[referencesField].forEach(({ trace, value }) => {
      const instance = data.playersByName.get(value);

      if(instance) {
        document[instancesField].push(instance);
        instance[backReferenceField].push(document);
      } else {
        const error = trace.error(`Im Feld "${trace.key}" wird die AkteurIn "${value}" angegeben, es wurde aber keine AkteurIn mit diesem Namen gefunden.`);

        data.warnings.push({
          files: [{ path: document.sourceFile, ranges: error.ranges }],
          message: error.message,
          snippet: error.snippet
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

// TODO: article .issue and .issueOnPages need to be cleared as a wipe step before reconnecting everything
// TODO: Strictly speaking there *could* be an article in multiple issues in which case the current model is incorrect

const connectIssuesWithArticles = data => {
  data.issues.forEach(issue => {
    issue.sections.forEach(section => {
      section.articles = [];
      section.articleReferences.forEach(reference => {
        const article = data.articlesByTitle.get(reference.title);

        if(article) {
          section.articles.push(article);

          article.issue = issue;
          article.inIssueOnPages = article.pages;
        } else {
          const error = reference.titleTrace.error(`In Zeitschrift N° ${issue.number} wird in der Rubrik "${section.title}" der Artikel "${reference.title}" referenziert, es wurde aber kein Artikel mit diesem Titel gefunden.`);

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
    data.radio.editorReferences.forEach(({ trace, value }) => {
      const player = data.playersByName.get(value);

      if(player) {
        data.radio.editors.push(player);
      } else {
        const error = trace.error(({ value }) => `Die AkteurIn "${value}", angegeben als Teil der allgemeinen Radio Redaktion, wurde nicht gefunden.`);

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

  connectBookReviews(data);

  connectPlayers(data, 'articles', 'authorReferences', 'authors', 'articles');
  connectPlayers(data, 'books', 'authorReferences', 'authors', 'authoredBooks');
  connectPlayers(data, 'books', 'publisherReferences', 'publishers', 'publishedBooks');
  connectPlayers(data, 'events', 'hostReferences', 'hosts', 'hostedEvents');
  connectPlayers(data, 'events', 'participantReferences', 'participants', 'eventParticipations');
  connectPlayers(data, 'programs', 'editorReferences', 'editors', 'programs');

  connectIssuesWithArticles(data);

  connectRadioEditors(data);

  return;
};
