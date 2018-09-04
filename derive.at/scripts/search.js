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
  html +=    article.authors.map(function(author) {
               return '<a class="generic__smaller_text" href="/autoren/' + author.permalink + '/">' + author.name + '</a>';
             }).join(', ');
  html += '  <div class="tile_header">';
  html += '    <a href="/texte/' + article.permalink + '/">' + article.title + '</a>';
  html += '  </div>';
  if(article.subtitle) {
    html += '  <div class="generic__subheading">';
    html += '    <a href="/texte/' + article.permalink + '/">' + article.subtitle + '</a>';
    html += '  </div>';
  }
  if(article.issue) {
    html += '  <div class="tile_image_split">';
    html += '    <div class="tile_image_split__image">';
    html += '      <img src="' + article.issue.cover.written +'" />';
    html += '    </div>';
    html += '    <div class="tile_image_split__meta">';
    html += '      <a href="/zeitschrift/' + article.issue.permalink + '/">dérive N°' + article.issue.number + '</a><br/>';
    html += '      Seiten: ' + article.inIssueOnPages;
    html += '    </div>';
    html += '  </div>';
  }
  html += '</div>';

  return html;
}

const authorResult = function(author) {
  let html = '';

  html += '<div class="tile">';
  html += '  <div class="tile_header">';
  html += '    <a href="/autoren/' + author.permalink + '/">' + author.name + '</a>';
  html += '  </div>';
  if(author.biography) {
    html += '<strong>' + author.biography.converted + '</strong>';
  }
  html += '</div>';

  return html;
}

const bookResult = function(book) {
  let html = '';

  html += '<div class="tile">';
  html += '  <div class="tile_header">';
  html += '    <a href="/buecher/' + book.permalink + '/">' + book.title + '</a>';
  html += '  </div>';
  html += '  <div class="tile_image_split">';
  html += '    <div class="tile_image_split__image">';
  if(book.cover) {
  html += '      <img src="' + book.cover.written +'" />';
  }
  html += '    </div>';
  html += '    <div class="tile_image_split__meta">';
  html +=        book.authors.map(function(author) {
                   return '<a class="generic__smaller_text" href="/autoren/' + author.permalink + '/">' + author.name + '</a>';
                 }).join(', ');

  html += '      <div class="generic__margin_vertical">';
  html += [
    book.placeOfPublication ? book.placeOfPublication + ':' : '',
    book.publishers.map(function(publisher) { return '<a href="/verlage/' + publisher.permalink + '/">' + publisher.name + '</a>'; }).join(', '),
    book.yearOfPublication ? '(' + book.yearOfPublication + ')' : ''
  ].join(' ').trim()
  html += '      </div>';

  if(book.reviews.length > 1) {
    html += '    Rezensionen lesen: ' + book.reviews.map(function(review, index) { return '<a href="/texte/' + review.permalink + '/">' + (index + 1) + '</a>'; }).join(' ');
  } else if(book.reviews.length === 1) {
    html += '    <a href="/texte/' + book.reviews[0].permalink + '/">Rezension lesen</a>';
  }
  html += '    </div>';
  html += '  </div>';
  html += '</div>';

  return html;
}

const formattedQuarter = {
  1: 'Jän - Mär',
  2: 'Apr - Juni',
  3: 'Juli - Sept',
  4: 'Okt - Dez'
};

const issueResult = function(issue) {
  let html = '';

  html += '<div class="tile">';
  html += '  <div class="tile_header">';
  html += '    <a href="/zeitschrift/' + issue.permalink + '/">dérive N°' + issue.number + '</a>';
  html += '  </div>';
  html += '  <div class="generic__subheading">';
  html += '    <a href="/zeitschrift/' + issue.permalink + '/">' + issue.title + '</a>';
  html += '  </div>';
  html += '  <div class="tile_image_split">';
  html += '    <div class="tile_image_split__image">';
  html += '      <img src="' + issue.cover.written +'" />';
  html += '    </div>';
  html += '    <div class="tile_image_split__meta">';
  html +=        formattedQuarter[issue.quarter] + ' / ' + issue.year + '<br/>';
  if(issue.outOfPrint) {
    html +=        'Vergriffen!';
  }
  html += '    </div>';
  html += '  </div>';
  html += '</div>';

  return html;
}

const programResult = function(program) {
  let html = '';

  html += '<div class="tile">';
  html += '  <div class="tile_header">';
  html += '    <a href="/radio/' + program.permalink + '/">' + program.title + '</a>';
  html += '  </div>';
  html += '  <div class="tile_image_split">';
  html += '    <div class="tile_image_split__image">';
  if(program.image) {
  html += '      <img src="' + program.image.written +'" />';
  }
  html += '    </div>';
  html += '    <div class="tile_image_split__meta">';
  if(program.subtitle) {
  html += '<strong><a href="/radio/' + program.permalink + '/">' + program.subtitle + '</a></strong>'
  }
  html += '      <div class="generic__margin_vertical">';
  html += '      <strong>Redaktion</strong><br/>';
  html +=        program.editors.map(function(editor) {
                   return '<a href="/autoren/' + editor.permalink + '/">' + editor.name + '</a>';
                 }).join(', ');
  html += '      </div>';

  html += '      <div class="generic__margin_vertical">';
  html += '        <strong>Erstaustrahlung</strong><br/>';
  html +=          program.firstBroadcast;
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
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
      document.querySelector('.search__query').innerHTML = search.query;

      let html = '';

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

document.addEventListener('turbolinks:render', renderSearch);
