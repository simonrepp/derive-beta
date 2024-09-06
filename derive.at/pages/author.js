const layout = require('./layout.js');
const { articleListing } = require('../widgets/articles.js');
const { bookListing } = require('../widgets/books.js');
const { programListing } = require('../widgets/programs.js');
const tags = require('../widgets/tags.js');
const { SECTION_AUTHORS } = require('../widgets/header.js');

module.exports = (data, author) => {
    const html = `
        <div>
            <div class="pagination">
                ${data.authorsPaginated.map(pagination => `<a href="/autorinnen/#${pagination.label}">${pagination.label}</a>`).join('')}
            </div>
            <h1>${author.name}</h1>
            ${author.text ?
                author.text.converted :
                (author.biography ? author.biography.converted : '')}

            ${author.website ? `
                <a href="${author.website}">Zur Website von ${author.name}</a>
            `:''}

            ${tags(author.tags)}
        </div>
        ${author.articles && author.articles.length > 0 ? `
            <h1>Artikel</h1>
            <div class="listings">
                ${author.articles.sort((a, b) => b.date - a.date).map(articleListing).join('<hr>')}
            </div>
        `:''}
        ${author.authoredBooks && author.authoredBooks.length > 0 ||
            author.publishedBooks && author.publishedBooks.length > 0 ? `
            <h1>Bücher</h1>
            <div class="listings">
                ${author.authoredBooks ? author.authoredBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookListing).join('<hr>') : ''}
                ${author.publishedBooks ? author.publishedBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookListing).join('<hr>') : ''}
            </div>
        `:''}
        ${author.programs && author.programs.length > 0 ? `
            <h1>Radio</h1>
            <div class="listings">
                ${author.programs.sort((a, b) => b.firstBroadcast - a.firstBroadcast).map(programListing).join('<hr>')}
            </div>
        `:''}
    `;

    return layout(data, html, { section: SECTION_AUTHORS, title: author.name });
};
