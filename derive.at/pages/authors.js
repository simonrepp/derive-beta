const layout = require('./layout.js');

// TODO: Match folded tiles style against rowild reference style and adapt
// TODO: Clip/Ellipsis content of author tiles when too big (fix current glitches)

// TODO: Turn letters into authorsPaginated schema as well

const letters = [
  '0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

exports.authorsPage = (data, letter) => {
  let filteredAuthors;

  if(letter === '0') {
    filteredAuthors = data.authors.filter(author =>
      author.name.match(/^[^a-zA-Z]/)
    );
  } else if(letter) {
    filteredAuthors = data.authors.filter(author =>
      author.name.match(new RegExp(`^${letter}`, 'i'))
    );
  } else {
    filteredAuthors = data.authors.filter(author => author.text && author.articles)
                                  .sort((a, b) => b.articles.length - a.articles.length)
                                  .slice(0, 50);
  }

  const html = `
    <div class="pagination">
      ${letters.map(iteratedLetter => `
        <a ${iteratedLetter === letter ? 'class="pagination--active"' : ''}
           href="/autoren/${iteratedLetter}/">${iteratedLetter}</a>
      `).join(' ')}
    </div>

    <div class="tiles">
      ${filteredAuthors.map(author => `
        <div class="tile">
          <h1>
            <a href="/autoren/${author.permalink}/">
              ${author.name}
            </a>
          </h1>

          ${author.biography ? `<strong>${author.biography}</strong>` : ''}

          ${author.text}
        </div>
      `).join('')}
    </div>
  `;

  return layout(html, { activeSection: 'Autoren', title: 'Autoren' });
};

exports.letters = letters;
