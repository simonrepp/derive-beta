const { bookListing } = require('../widgets/books.js');
const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { SECTION_BOOKS } = require('../widgets/header.js');

// TODO: Centered reduced simple layout for Verlag and Autor Page

module.exports = (data, publisher) => {
    const html = `
        <div>
            <h1>${publisher.name}</h1>

            ${publisher.biography ? `<strong>${publisher.biography.converted}</strong>` : ''}

            ${publisher.text ? `
                ${publisher.text.converted}
            `:''}

            ${[publisher.country, publisher.city].filter(Boolean).join(', ')}<br>
            ${publisher.website ? `
                <a href="${publisher.website}">Zur Website von ${publisher.name}</a>
            `:''}
        </div>

        ${publisher.publishedBooks ? `
            <h1>Weitere Publikationen bei ${publisher.name}</h1>

            <div class="listings">
                ${publisher.publishedBooks.map(bookListing).join('')}
            </div>
        `:''}
    `;

    return layout(data, html, { section: SECTION_BOOKS, title: publisher.name });
};
