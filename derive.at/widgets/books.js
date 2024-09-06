const moment = require('moment');

const { authors, authorsSmall } = require('./authors.js');
const tags = require('./tags.js');

function bookFeature(book) {
    return `
        <div class="featured">
            <div class="featured_image">
                ${book.cover ? `<img src="${book.cover.written}">` : ''}
            </div>
            <div class="featured_text">
                ${authors(book.authors)}

                <h1 class="heading">${book.title}</h1>

                ${book.description ? `<div>${book.description.converted}</div>` : ''}

                <div class="vertical_margin">
                    ${[
                        book.placeOfPublication ? `${book.placeOfPublication}:` : '',
                        book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
                        book.yearOfPublication ? `(${book.yearOfPublication})` : ''
                    ].join(' ').trim()}
                </div>

                ${book.reviews.length > 0 ? `<strong>${bookReviews(book)}</strong>` : ''}

                ${tags(book.tags)}
            </div>
        </div>
    `.trim();
}

function bookListing(book) {
    return `
        <div class="listing_split">
            <div>
                ${book.cover ? `<img src="${book.cover.written}">`:''}
            </div>
            <div>
                ${authors(book.authors)}
                <div class="heading">
                    <a href="/buecher/${book.permalink}/">
                        ${book.title}
                    </a>
                </div>
                <div class="vertical_margin">
                    ${[
                        book.placeOfPublication ? `${book.placeOfPublication}:` : '',
                        book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
                        book.yearOfPublication ? `(${book.yearOfPublication})` : ''
                    ].join(' ').trim()}
                </div>
                <p>
                    ${bookReviews(book)}
                </p>
            </div>
        </div>
    `;
}

function bookReviews(book) {
    if(book.reviews.length > 1) {
        return `
            <div class="call_out_buttons_spaced">
                ${book.reviews.map((review, index) =>
                    `<a class="call_out_button" href="/texte/${review.permalink}/">Rezension #${index + 1} lesen</a>
                `).join(' ')}
            </div>
        `;
    } else if(book.reviews.length === 1) {
        return `<a class="call_out_button" href="/texte/${book.reviews[0].permalink}/">Rezension lesen</a>`;
    } else {
        return '';
    }
}

exports.bookFeature = bookFeature;
exports.bookListing = bookListing;
