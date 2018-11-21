const articleResult = article => `
<div class="tile">
  ${article.authors.map(author =>
    `<a class="generic__smaller_text" href="/autoren/${author.permalink}/">${author.name}</a>`
  ).join(', ')}
  <div class="tile_header">
    <a href="/texte/${article.permalink}/">${article.title}</a>
  </div>
  ${article.subtitle ? `
    <div class="generic__subheading">
      <a href="/texte/${article.permalink}/">${article.subtitle}</a>
    </div>
  `:''}
  ${article.issue ? `
    <div class="tile_image_split">
      <div class="tile_image_split__image">
        <img src="${article.issue.cover.written}">
      </div>
      <div class="tile_image_split__meta">
        <a href="/zeitschrift/${article.issue.permalink}/">dérive N°${article.issue.number}</a><br/>
        Seiten: ${article.inIssueOnPages}
      </div>
    </div>
  `:''}
</div>
`;

const authorResult = author => `
<div class="tile">
  <div class="tile_header">
    <a href="/autoren/${author.permalink}/">${author.name}</a>
  </div>
  ${author.biography ? `
    <strong>${author.biography.converted}</strong>
  `:''}
</div>
`;

const bookResult = book => `
<div class="tile">
  <div class="tile_header">
    <a href="/buecher/${book.permalink}/">${book.title}</a>
  </div>
  <div class="tile_image_split">
    <div class="tile_image_split__image">
      ${book.cover ? `<img src="${book.cover.written}">` : ''}
    </div>
    <div class="tile_image_split__meta">
      ${book.authors.map(author => `<a class="generic__smaller_text" href="/autoren/${author.permalink}/">${author.name}</a>`).join(', ')}
      <div class="generic__margin_vertical">
       ${[
          book.placeOfPublication ? book.placeOfPublication : '',
          book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
          book.yearOfPublication ? `(${book.yearOfPublication})` : ''
        ].join(' ').trim()}
      </div>

      ${book.reviews.length > 1 ? `
        Rezensionen lesen: ${book.reviews.map((review, index) => `<a href="/texte/${review.permalink}/">${index + 1}</a>`).join(' ')}
      `:''}

      ${book.reviews.length === 1 ? `
        <a href="/texte/${book.reviews[0].permalink}/">Rezension lesen</a>
      `:''}
    </div>
  </div>
</div>
`;

const formattedQuarter = {
  1: 'Jän - Mär',
  2: 'Apr - Juni',
  3: 'Juli - Sept',
  4: 'Okt - Dez'
};

const issueResult = issue => `
<div class="tile">
  <div class="tile_header">
    <a href="/zeitschrift/${issue.permalink}/">dérive N°${issue.number}</a>
  </div>
  <div class="generic__subheading">
    <a href="/zeitschrift/${issue.permalink}/">${issue.title}</a>
  </div>
  <div class="tile_image_split">
    <div class="tile_image_split__image">
      <img src="${issue.cover.written}">
    </div>
    <div class="tile_image_split__meta">
    ${formattedQuarter[issue.quarter]} / ${issue.year}<br/>
    ${issue.outOfPrint ? 'Vergriffen!' : ''}
    </div>
  </div>
</div>
`;

const programResult = program => `
<div class="tile">
  <div class="tile_header">
    <a href="/radio/${program.permalink}/">${program.title}</a>
  </div>
  <div class="tile_image_split">
    <div class="tile_image_split__image">
      ${program.image ? `<img src="${program.image.written}">` : ''}
    </div>
    <div class="tile_image_split__meta">
      ${program.subtitle ? `<strong><a href="/radio/${program.permalink}/">${program.subtitle}</a></strong>` : ''}
      <div class="generic__margin_vertical">
      <strong>Redaktion</strong><br/>
        ${program.editors.map(editor => `<a href="/autoren/${editor.permalink}/">${editor.name}</a>`).join(', ')}
      </div>
      <div class="generic__margin_vertical">
        <strong>Erstaustrahlung</strong><br/>
        ${program.firstBroadcast}
      </div>
    </div>
  </div>
</div>
`;

module.exports = () => {
  window.search = {
    message: null,
    pending: false,
    query: '',
    sections: {
      articles: true,
      authors: true,
      books: true,
      issues: true,
      programs: true
    }
  };

  window.renderSearch = () => {
    const sectionCheckboxes = document.querySelectorAll('span[data-section]');
    for(let checkbox of sectionCheckboxes) {
      const section = checkbox.dataset.section;

      if(window.search.sections[section]) {
        checkbox.classList.remove('icon-checkbox');
        checkbox.classList.add('icon-checkbox-checked');
      } else {
        checkbox.classList.remove('icon-checkbox-checked');
        checkbox.classList.add('icon-checkbox');
      }
    }

    const results = document.querySelector('.search__results');

    if(results) {
      if(window.search.results) {
        document.querySelector('.search__query').innerHTML = window.search.query;

        let html = '';

        for(let result of window.search.results) {
          if(result.hasOwnProperty('article')) {
            html += articleResult(result.article);
          } else if(result.hasOwnProperty('author')) {
            html += authorResult(result.author);
          } else if(result.hasOwnProperty('book')) {
            html += bookResult(result.book);
          } else if(result.hasOwnProperty('issue')) {
            html += issueResult(result.issue);
          } else if(result.hasOwnProperty('program')) {
            html += programResult(result.program);
          }
        }

        results.innerHTML = html;
      } else if(window.search.pending) {
        results.innerHTML = 'Suche läuft';
      } else if(window.search.error) {
        results.innerHTML = window.search.error;
      }
    }
  }

  window.renderSearch();

  document.addEventListener('turbolinks:render', window.renderSearch);
};
