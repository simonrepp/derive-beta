const slug = require('speakingurl');

const { random } = require('./util.js');

const addToCategories = (data, collection) => {
    data[collection].forEach(document => {
        document.categories = [];
        document.categoriesDisconnected.forEach(category => {
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
                document.categories.push(existingCategory);
            } else {
                const categoryData = {
                    name: category,
                    permalink: categoryPermalink,
                    referenceCount: 1,
                    spellings: new Set([category])
                };

                categoryData[collection] = [document];

                data.categories.set(categoryPermalink, categoryData);
                document.categories.push(categoryData);
            }
        });
    });
};

const addToTags = (data, collection) => {
    data[collection].forEach(document => {
        document.tags = [];
        document.tagsDisconnected.forEach(tag => {
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
                document.tags.push(existingTag);
            } else {
                const tagData = {
                    name: tag,
                    permalink: tagPermalink,
                    referenceCount: 1,
                    spellings: new Set([tag])
                };

                tagData[collection] = [document];

                data.tags.set(tagPermalink, tagData);
                document.tags.push(tagData);
            }
        });
    });
};

const paginateAuthors = data => {
    const LETTERS = [
        '0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    const paginations = new Map();
    for (const letter of LETTERS) {
        paginations.set(letter, {
            authors: [],
            label: letter
        });
    }

    const authorsSorted = data.authors.sort((a, b) =>
        (a.lastName || a.name).localeCompare(b.lastName || b.name)
    );

    for (const author of authorsSorted) {
        if(!author.articles?.length && !author.programs?.length && !author.authoredBooks?.length)
            continue;

        const relevantName = author.lastName || author.name;
        const firstLetter = relevantName.charAt(0)
                                        .normalize('NFD')
                                        .replace(/[\u0300-\u036f]/g, '')
                                        .toUpperCase()
                                        .replace('Ł', 'L');

        let pagination = paginations.get(firstLetter) ?? paginations.get('0');

        pagination.authors.push(author);
    }

    data.authorsPaginated = Array.from(paginations.values());
};

const paginateBooks = data => {
    data.booksPaginated = [];
    const booksSorted = Array.from(data.books.values()).sort((a, b) => {
        if(a.featuredRank) {
            if(b.featuredRank) {
                return a.featuredRank - b.featuredRank;
            } else {
                return -1;
            }
        } else if(b.featuredRank) {
            return 1;
        } else {
            return b.yearOfPublication - a.yearOfPublication;
        }
    });

    let pageIndex = 0;
    for(let bookIndex = 0; bookIndex < booksSorted.length; bookIndex += 100) {
        const pagination = {
            books: booksSorted.slice(bookIndex, bookIndex + 100),
            label: (pageIndex + 1).toString()
        };

        if(pageIndex === 0) {
            pagination.featured = pagination.books[0];
        } else {
            pagination.featured = random(pagination.books);
        }

        data.booksPaginated.push(pagination);
        pageIndex += 1;
    }
};

const paginatePrograms = data => {
    data.programsPaginated = [];
    const programsSorted = Array.from(data.programs.values()).sort((a, b) => b.firstBroadcast - a.firstBroadcast);

    programsSorted.forEach((program, index) => {
        const label = program.firstBroadcast.getFullYear().toString();
        const existingPagination = data.programsPaginated.find(pagination => pagination.label === label);

        if(existingPagination) {
            existingPagination.programs.push(program);
        } else {
            const pagination = {
                label: label,
                programs: [program]
            };

            if(index === 0) {
                pagination.featured = pagination.programs[0];
            } else {
                pagination.featured = random(pagination.programs);
            }

            data.programsPaginated.push(pagination);
        }
    });
};

module.exports = data => {

    data.categories.clear();

    addToCategories(data, 'articles');
    addToCategories(data, 'programs');

    data.tags.clear();

    addToTags(data, 'articles');
    addToTags(data, 'books');
    addToTags(data, 'issues');
    addToTags(data, 'players');
    addToTags(data, 'programs');

    data.authors = [];
    data.bookAuthors = [];
    data.publishers = [];

    data.players.forEach(player => {
        if(player.articles || player.programs) {
            data.authors.push(player);
        }
        if(player.publishedBooks) {
            data.publishers.push(player);
        }
        if(player.authoredBooks) {
            data.bookAuthors.push(player);
        }
    });

    data.readableArticles = Array.from(data.articles.values()).filter(article => article.readable);

    data.issuesDescending = Array.from(data.issues.values()).sort((a, b) => b.number.localeCompare(a.number, undefined, { numeric: true }));

    paginateAuthors(data);
    paginateBooks(data);
    paginatePrograms(data);
};
