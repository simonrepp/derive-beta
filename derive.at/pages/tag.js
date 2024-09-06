const layout = require('./layout.js');
const { articleListing } = require('../widgets/articles.js');
const { bookListing } = require('../widgets/books.js');
const { programListing } = require('../widgets/programs.js');

module.exports = (data, tag) => {
    const html = `
        <div>
            <div class="vertical_margin">
                <strong>Alle Inhalte zum Tag "${tag.name}"</strong>
            </div>

            ${tag.articles ? `
                <h1>Artikel</h1>
                <div class="listings">
                    ${tag.articles.map(articleListing).join('<hr>')}
                </div>
            `:''}

            ${tag.books ? `
                <h1>Bücher</h1>
                <div class="listings">
                    ${tag.books.map(bookListing).join('<hr>')}
                </div>
            `:''}

            ${tag.programs ? `
                <h1>Radio</h1>
                <div class="listings">
                    ${tag.programs.map(programListing).join('<hr>')}
                </div>

            `:''}
        </div>
    `;

    return layout(data, html, { title: tag.name });
};
