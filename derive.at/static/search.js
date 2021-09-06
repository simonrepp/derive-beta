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
        <a href="/zeitschrift/${article.issue.permalink}/">dérive N°${article.issue.number}</a><br>
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
    ${formattedQuarter[issue.quarter]} / ${issue.year}<br>
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
      <strong>Redaktion</strong><br>
        ${program.editors.map(editor => `<a href="/autoren/${editor.permalink}/">${editor.name}</a>`).join(', ')}
      </div>
      <div class="generic__margin_vertical">
        <strong>Erstaustrahlung</strong><br>
        ${program.firstBroadcast}
      </div>
    </div>
  </div>
</div>
`;

function renderSearch() {
    const search = new URLSearchParams(window.location.search);
    const query = search.get('begriff');
    const sections = search.get('filter').split(',');

    const sectionCheckboxes = document.querySelectorAll('span[data-section]');
    for (const checkbox of sectionCheckboxes) {
        const section = checkbox.dataset.section;

        if (sections.includes(section)) {
            checkbox.classList.remove('icon-checkbox');
            checkbox.classList.add('icon-checkbox-checked');
        } else {
            checkbox.classList.remove('icon-checkbox-checked');
            checkbox.classList.add('icon-checkbox');
        }
    }

    document.querySelector('.search__query').innerHTML = query;
    document.querySelector('.search__searchform input[name="query"]').value = query;
    document.querySelector('.sidebar__searchform  input[name="query"]').value = query;
    const results = document.querySelector('.search__results');

    if(results) {
        if (!location.hostname.match(/derive\.at/)) {
            results.innerHTML = 'Die Suche ist beim lokalen Testen nicht verfügbar da sie auf PHP angewiesen ist.';
        } else if (query.length < 1) {
            results.innerHTML = 'Mindestens zwei Buchstaben erforderlich.';    
        } else {
            results.innerHTML = 'Suche läuft';
            
            const sectionsMapped = sections.map(section => 
                ({
                    'autoren': 'authors',
                    'bücher': 'books',
                    'radio': 'programs',
                    'texte': 'articles',
                    'zeitschrift': 'issues'
                }[section])
            ).join(',');
            
            fetch(`/api/search/?query=${encodeURI(query)}&sections=${sectionsMapped}`)
                .then(response => response.json())
                .then(data => {
                    let html = '';

                    for (const result of data) {
                        if (result.hasOwnProperty('article')) {
                            html += articleResult(result.article);
                        } else if (result.hasOwnProperty('author')) {
                            html += authorResult(result.author);
                        } else if (result.hasOwnProperty('book')) {
                            html += bookResult(result.book);
                        } else if (result.hasOwnProperty('issue')) {
                            html += issueResult(result.issue);
                        } else if (result.hasOwnProperty('program')) {
                            html += programResult(result.program);
                        }
                    }

                    results.innerHTML = html;
                })
                .catch(error => {
                    results.innerHTML = `Fehler: ${error}`;
                });
        }
    }
}

window.addEventListener('DOMContentLoaded', renderSearch);
