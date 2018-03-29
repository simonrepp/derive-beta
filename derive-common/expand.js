const addToCategories = (data, collection) => {
  data[collection].forEach(document => {
    document.categories.forEach(category => {
      const existingCategory = data.categories.get(category);

      if(existingCategory) {
        const existingCategoryCollection = existingCategory.get(collection);

        if(existingCategoryCollection) {
          existingCategoryCollection.push(document);
        } else {
          existingCategory.set(collection, [document]);
        }

        existingCategory.set('referenceCount', existingCategory.get('referenceCount') + 1);
      } else {
        data.categories.set(category, new Map([[ collection, [document] ], [ 'referenceCount', 1 ]]))
      }
    });
  });
};

const addToTags = (data, collection) => {
  data[collection].forEach(document => {
    document.tags.forEach(tag => {
      const existingTag = data.tags.get(tag);

      if(existingTag) {
        const existingTagCollection = existingTag.get(collection);

        if(existingTagCollection) {
          existingTagCollection.push(document);
        } else {
          existingTag.set(collection, [document]);
        }

        existingTag.set('referenceCount', existingTag.get('referenceCount') + 1);
      } else {
        data.tags.set(tag, new Map([[ collection, [document] ], [ 'referenceCount', 1 ]]))
      }
    });
  });
};

module.exports = data => {

  data.categories.clear();

  addToCategories(data, 'articles');
  addToCategories(data, 'events');
  addToCategories(data, 'programs');

  data.tags.clear();

  addToTags(data, 'articles');
  addToTags(data, 'books');
  addToTags(data, 'events');
  addToTags(data, 'issues');
  addToTags(data, 'players');
  addToTags(data, 'programs');

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
