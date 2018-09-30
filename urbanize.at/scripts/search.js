const eventResult = function(event) {
  let html = '';

  html += '<div class="list-item">';
  if(event.image) {
    html += '<img class="teaser-image" src="' + event.image.written + '">';
  }
  html += '  <strong class="generic__subheading">';
  html += '    <a href="/veranstaltungen/' + event.permalink + '">' + event.title + '</a>';
  html += '  </strong>';
  html += '  <div class="additional">';
  html += '    <span>';
  for(let date of event.dates) {
    html +=      moment(date.date).locale('de').format('dddd, D.M.YYYY') + '<br/>';
  }
  html += '    </span>';
  html +=      event.address;
  html += '  </div>';
  html += '  <div>';
  html +=      event.abstract ? event.abstract.converted : '';
  html += '  </div>';
  html += '</div>';

  return html;
}

const pageResult = function(page) {
  let html = '';

  html += '<div class="list-item">';
  html += '  <strong>';
  html += '    <a href="/seiten/' + page.permalink + '">' + page.title + '</a>';
  html += '  </strong>';
  html += '</div>';

  return html;
}

const search = function(target) {
  const queryRegex = /begriff=([^$&]*)/;
  const match = queryRegex.exec(location.search);
  const query = match[1];

  const showError = function(message) {
    let html = '';
    html += '<div class="generic__heading">Suchresultate für "' + query + '"</div>'
    html += '<div class="message">' + message + '</div>'

    document.querySelector('.results').innerHTML = html;
  };

  const showResults = function(results) {
    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'textRegular',
        'textBoosted'
      ]
    };

    const fuse = new Fuse(results, options);
    const result = fuse.search(query);

    let html = '';
    html += '<div class="generic__heading">Suchresultate für "' + query + '"</div>';

    for(let item of result) {
      if(item.hasOwnProperty('event')) {
        html += eventResult(item.event);
      } else if(item.hasOwnProperty('page')) {
        html += pageResult(item.page);
      }
    }

    document.querySelector(target).innerHTML = html;
  };

  if(query.length < 2) {
    showError('Für eine Suche sind mindestens zwei Buchstaben erforderlich.');
  } else {
    let request = new XMLHttpRequest();
    const url = '/suche/index.json';

    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE) {
        if(request.status == 200) {
          const results = JSON.parse(request.responseText);

          showResults(results);
        } else if(request.status == 400) {
          showError('Fehlercode 400 - Falsche Parameter in der Anfrage an die API');
        } else {
          showError('Fehlercode ' + request.status)
        }
      }
    };

    request.open('GET', url, true);
    request.send();
  }
}

document.addEventListener('submit', function(event) {
  if(event.target.classList.contains('search')) {
    event.preventDefault();

    const query = event.target.children.begriff.value.replace(' ', '%20');

    Turbolinks.visit('/suche/?begriff=' + query);
  }
});

const triggerSearch = function() {
  const searchTrigger = document.querySelector('.search__results');

  if(searchTrigger) {
    search('.search__results');
  }
};

triggerSearch();

document.addEventListener("turbolinks:render", triggerSearch);
