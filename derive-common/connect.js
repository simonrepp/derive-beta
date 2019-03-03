const clearBackReferences = data => {
  data.articles.forEach(article => {
    article.issue = null;
    article.inIssueOnPages = null;
  });

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

const clearLookupStructures = data => {
  delete data.articlesByTitle;
  delete data.booksByTitle;
  delete data.playersByName;
};

const connectBookReviews = data => {
  data.articles.forEach(article => {
    article.reviewedBooks = [];
    for(const { item, title } of article.reviewedBookReferences) {
      const book = data.booksByTitle.get(title);

      if(book) {
        if(!article.draft && !book.draft) {
          article.reviewedBooks.push(book);
          book.reviews.push(article);
        }
      } else {
        const error = item.valueError(`Das verlinkte Buch mit dem Titel '${title}' wurde nicht gefunden - möglicherweise ein Tippfehler?`);

        data.warnings.push({
          files: [{ path: article.sourceFile, selection: error.selection }],
          message: error.text,
          snippet: error.snippet
        });
      }
    }
  });
};

const connectPlayers = (data, collection, referencesField, instancesField, backReferenceField) => {
  data[collection].forEach(document => {
    document[instancesField] = [];
    for(const { item, name } of document[referencesField]) {
      const instance = data.playersByName.get(name);

      if(instance) {
        if(!document.draft && !instance.draft) {
          document[instancesField].push(instance);
          instance[backReferenceField].push(document);
        }
      } else {
        const error = item.valueError(`Die verlinkte AkteurIn mit dem Namen '${name}' wurde nicht gefunden - möglicherweise ein Tippfehler?`);

        data.warnings.push({
          files: [{ path: document.sourceFile, selection: error.selection }],
          message: error.text,
          snippet: error.snippet
        });
      }
    }
  });
};

// TODO: Strictly speaking there *could* be an article in multiple issues in which case the current model is incorrect, maybe bring this up with derive just to get an impression

const connectIssuesWithArticles = data => {
  data.issues.forEach(issue => {
    issue.sections.forEach(section => {
      section.articles = [];
      section.articleReferences.forEach(reference => {
        const article = data.articlesByTitle.get(reference.title);

        if(article) {
          if(!issue.draft && !article.draft) {
            section.articles.push(article);

            article.issue = issue;
            article.inIssueOnPages = reference.pages;
          }
        } else {
          const error = reference.titleField.valueError(`Der referenzierte Artikel mit dem Titel '${reference.title}' wurde nicht gefunden - möglicherweise ein Tippfehler?`);

          data.warnings.push({
            files: [{ path: issue.sourceFile, selection: error.selection }],
            message: error.text,
            snippet: error.snippet
          });
        }
      });
    });
  });
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

  clearLookupStructures(data);

  return;
};
