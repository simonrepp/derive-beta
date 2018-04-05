const slug = require('speakingurl');

const addToCategories = (data, collection) => {
  data[collection].forEach(document => {
    document.categories.connected = [];
    document.categories.sourced.forEach(category => {
      const categoryPermalink = slug(category);
      const existingCategory = data.categories.get(categoryPermalink);

      if(existingCategory) {
        if(existingCategory.hasOwnProperty(collection)) {
          existingCategory[collection].push(document);
        } else {
          existingCategory[collection] = [document];
        }

        existingCategory.referenceCount += 1;
        existingCategory.spellings.add(category);
        document.categories.connected.push(existingCategory);
      } else {
        const categoryData = {
          name: category,
          permalink: categoryPermalink,
          referenceCount: 1,
          spellings: new Set([category])
        };

        categoryData[collection] = [document];

        data.categories.set(categoryPermalink, categoryData);
        document.categories.connected.push(categoryData);
      }
    });
  });
};

const addToTags = (data, collection) => {
  data[collection].forEach(document => {
    document.tags.connected = [];
    document.tags.sourced.forEach(tag => {
      const tagPermalink = slug(tag);
      const existingTag = data.tags.get(tagPermalink);

      if(existingTag) {
        if(existingTag.hasOwnProperty(collection)) {
          existingTag[collection].push(document);
        } else {
          existingTag[collection] = [document];
        }

        existingTag.referenceCount += 1;
        existingTag.spellings.add(tag);
        document.tags.connected.push(existingTag);
      } else {
        const tagData = {
          name: tag,
          permalink: tagPermalink,
          referenceCount: 1,
          spellings: new Set([tag])
        };

        tagData[collection] = [document];

        data.tags.set(tagPermalink, tagData);
        document.tags.connected.push(tagData);
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

  data.booksPaginated = [];
  const booksSorted = Array.from(data.books.values()).sort((a, b) => b.yearOfPublication - a.yearOfPublication);
  for(let index = 0; index < booksSorted.length; index += 100) {
    const pagination = {
      books: booksSorted.slice(index, index + 100),
      label: `${index + 1}-${index + 100 >= data.books.size ? data.books.size : index + 100}`
    };

    data.booksPaginated.push(pagination);
  }
};
