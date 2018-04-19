const search = {
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

const articleResult = function(article) {
  let html = '';

  html += '<div class="tile">';
  html += '  <h1>';
  html += '    <a href="/texte/' + article.permalink + '/">' + article.title + '</a>';
  html += '  </h1>';
  html += '</div>';

  return html;
}

const authorResult = function(author) {
  let html = '';

  html += '<div class="tile">';
  html += '  <h1>';
  html += '    <a href="/autoren/' + author.permalink + '/">' + author.name + '</a>';
  html += '  </h1>';
  if(author.biography) {
    html += '<strong>' + author.biography.converted + '</strong>';
  }
  html += '</div>';

  return html;
}

const bookResult = function(book) {
  let html = '';

  html += '<div class="tile">';
  html += '  <h1>';
  html += '    <a href="/bücher/' + book.permalink + '/">' + book.title + '</a>';
  html += '  </h1>';
  html += '</div>';

  return html;
}

const issueResult = function(issue) {
  let html = '';

  html += '<div class="tile">';
  html += '  <h1>';
  html += '    <a href="/zeitschrift/' + issue.number + '/">' + issue.title + '</a>';
  html += '  </h1>';
  html += '</div>';

  return html;
}

const programResult = function(program) {
  let html = '';

  html += '<div class="tile">';
  html += '  <h1>';
  html += '    <a href="/radio/' + program.permalink + '/">' + program.title + '</a>';
  html += '  </h1>';
  html += '</div>';

  return html;
}

const renderSearch = function() {
  const sectionCheckboxes = document.querySelectorAll('span[data-section]');
  for(let checkbox of sectionCheckboxes) {
    const section = checkbox.dataset.section;

    if(search.sections[section]) {
      checkbox.classList.remove('icon-checkbox');
      checkbox.classList.add('icon-checkbox-checked');
    } else {
      checkbox.classList.remove('icon-checkbox-checked');
      checkbox.classList.add('icon-checkbox');
    }
  }

  const results = document.querySelector('.search__results');

  if(results) {
    if(search.results) {
      let html = '';

      html += 'Suchergebnisse für:<br/>';
      html += '<h2>' + search.query + '</h2>';

      search.results.forEach(function(result) {
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
      });

      results.innerHTML = html;
    } else if(search.pending) {
      results.innerHTML = 'Suche laeuft';
    } else if(search.error) {
      results.innerHTML = search.error;
    }
  }
}

renderSearch();

document.addEventListener("turbolinks:render", renderSearch);
