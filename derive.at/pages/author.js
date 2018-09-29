const layout = require('./layout.js'),
      articleTile = require('../widgets/articles/tile.js'),
      bookTile = require('../widgets/books/tile.js'),
      eventTile = require('../widgets/event-tile.js'),
      programTile = require('../widgets/program-tile.js'),
      tags = require('../widgets/tags.js');

const eventSort = (a, b) => {
  if(a.dates && a.dates.length > 0) {
    if(b.dates && b.dates.length > 0) {
      return b.dates[b.dates.length - 1].date - a.dates[a.dates.length - 1].date;
    } else {
      return -1;
    }
  } else if(b.dates && b.dates.length > 0) {
    return 1;
  } else {
    return 0;
  }
};

module.exports = (data, author) => {
  const html = `
    <div>
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

      <div class="tiles">
        ${author.articles.sort((a, b) => b.date - a.date).map(articleTile).join('')}
      </div>
    `:''}

    ${author.authoredBooks && author.authoredBooks.length > 0 ||
      author.publishedBooks && author.publishedBooks.length > 0 ? `
      <h1>Bücher</h1>

      <div class="tiles">
        ${author.authoredBooks ? author.authoredBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookTile).join('') : ''}
        ${author.publishedBooks ? author.publishedBooks.sort((a, b) => b.yearOfPublication - a.yearOfPublication).map(bookTile).join('') : ''}
      </div>
    `:''}

    ${author.programs && author.programs.length > 0 ? `
      <h1>Radio</h1>

      <div class="tiles">
        ${author.programs.sort((a, b) => b.firstBroadcast - a.firstBroadcast).map(programTile).join('')}
      </div>

    `:''}

    ${author.eventParticipations && author.eventParticipations.length > 0 ? `
      <h1>Veranstaltungen</h1>

      <div class="tiles">
        ${author.eventParticipations.sort(eventSort).map(eventTile).join('')}
      </div>
    `:''}
  `;

  return layout(data, html, { activeSection: 'Autoren', title: author.name });
};
