const moment = require('moment');
const Fuse = require('fuse.js');

module.exports = () => {
  const eventResult = event => `
  <div class="list-item">
    ${event.image ? `<img class="teaser-image" src="${event.image.writtenCropped}">` : ''}

    <strong class="generic__subheading">
      <a href="/veranstaltungen/${event.permalink}">${event.title}</a>
    </strong>
    <div class="additional">
      <span>
        ${event.dates.map(date => `${moment(date.date).locale('de').format('dddd, D.M.YYYY')}<br/>`).join('')}
      </span>
      ${event.address}
    </div>
    <div>
      ${event.abstract ? event.abstract.converted : ''}
    </div>
  </div>
  `;

  const pageResult = page => `
    <div class="list-item">
      <strong>
        <a href="/seiten/${page.permalink}">${page.title}</a>
      </strong>
    </div>
  `;

  const search = target => {
    const queryRegex = /begriff=([^$&]*)/;
    const match = queryRegex.exec(location.search);
    const query = match[1];

    const showError = message => {
      let html = `
  <div class="generic__heading">Suchresultate für '${query}'</div>
  <div class="message">${message}</div>
      `;

      document.querySelector('.results').innerHTML = html;
    };

    const showResults = results => {
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

      let html = `<div class="generic__heading">Suchresultate für "${query}"</div>`;

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
      const request = new XMLHttpRequest();
      const url = '/suche/index.json';

      request.onreadystatechange = function() {
        if(request.readyState == XMLHttpRequest.DONE) {
          if(request.status == 200) {
            const results = JSON.parse(request.responseText);

            showResults(results);
          } else if(request.status == 400) {
            showError('Fehlercode 400 - Falsche Parameter in der Anfrage an die API');
          } else {
            showError(`Fehlercode ${request.status}`);
          }
        }
      };

      request.open('GET', url, true);
      request.send();
    }
  }

  document.addEventListener('submit', event => {
    if(event.target.classList.contains('search')) {
      event.preventDefault();

      const query = event.target.children.begriff.value.replace(' ', '%20');  // TODO: encodeURI something instead?

      Turbolinks.visit(`/suche/?begriff=${query}`);
    }
  });

  const triggerSearch = () => {
    const searchTrigger = document.querySelector('.search__results');

    if(searchTrigger) {
      search('.search__results');
    }
  };

  triggerSearch();

  document.addEventListener('turbolinks:render', triggerSearch);
};
