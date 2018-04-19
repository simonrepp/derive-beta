const layout = require('./layout.js');

module.exports = (data, pagination) => {
  let authors;

  if(pagination) {
    authors = pagination.authors;
  } else {
    authors = data.authors.filter(author => author.text && author.articles)
                          .sort((a, b) => b.articles.length - a.articles.length)
                          .slice(0, 50);
  }

  const html = `
    <br/>

    <div class="pagination">
      ${data.authorsPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/autoren/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' ')}
    </div>

    <div class="tiles">
      ${authors.map(author => `
        <div class="tile">
          <h1>
            <a href="/autoren/${author.permalink}/">
              ${author.name}
            </a>
          </h1>

          ${author.biography ? `<strong>${author.biography.converted}</strong>` : ''}

          ${author.text ? author.text.converted : ''}
        </div>
      `).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Autoren', title: 'Autoren' });
};
