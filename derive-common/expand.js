const add = (data, collection) => {
  data[collection].forEach(document => {
    document.tags.forEach(tag => {
      if(data.tags[tag]) {
        if(data.tags[tag][collection]) {
          data.tags[tag][collection].push(document);
        } else {
          data.tags[tag][collection] = [document];
        }
      } else {
        data.tags[tag] = {};
        data.tags[tag][collection] = [document];
      }
    });
  });
};

module.exports = data => {

  // TODO: Consider a map for tags
  data.tags = {};

  add(data, 'articles');
  add(data, 'books');
  add(data, 'events');
  add(data, 'issues');
  add(data, 'players');
  add(data, 'programs');

  data.authors = [];
  data.bookAuthors = [];
  data.publishers = [];

  data.players.forEach(player => {
    if(player.eventParticipations || player.articles || player.programs) {
      data.authors.push(player);
    }
    if(player.publishedBooks) {
      data.publishers.push(player);
    }
    if(player.authoredBooks) {
      data.bookAuthors.push(player);
    }
  });
};
