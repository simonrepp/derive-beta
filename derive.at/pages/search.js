const layout = require('./layout.js');

module.exports = data => {
  const html = `
    <div>
      <h1>Suche</h1>

      <div class="results tiles">
        Suche läuft ...
      </div>
    </div>

    <script type="text/javascript">

      const showResults = function(results) {
        let html = '';

        results.forEach(function(result) {
          if(result.hasOwnProperty('article')) {
            const article = result.article;

            html += '<div><a href="/texte/' + article.permalink + '/">' + article.title + '</a></div>';
          } else if(result.hasOwnProperty('author')) {
            const author = result.author;

            html += '<div class="tile">';
            html += '  <h1>';
            html += '    <a href="/autoren/' + author.permalink + '/">' + author.name + '</a>';
            html += '  </h1>';
            if(author.biography) {
              html += '<strong>' + author.biography + '</strong>';
            }
            html += '</div>';
            ;
          } else if(result.hasOwnProperty('book')) {
            const book = result.book;

            html += '<div><a href="/bücher/' + book.permalink + '/">' + book.title + '</a></div>';
          } else if(result.hasOwnProperty('issue')) {
            const issue = result.issue;

            html += '<div><a href="/zeitschrift/' + issue.number + '/">' + issue.title + '</a></div>';
          } else if(result.hasOwnProperty('program')) {
            const program = result.program;

            html += '<div><a href="/radio/' + program.permalink + '/">' + program.title + '</a></div>';
          }
        });

        document.querySelector('.results').innerHTML = html;
      };

      const showError = function(message) {
        document.querySelector('.results').innerHTML = message;
      }

      const params = location.search.replace(/begriff=/, 'query=')
                                    .replace(/bereiche=[^$&]+/, function(kv) {
                                      return kv.replace('bereiche', 'sections')
                                               .replace('autoren', 'authors')
                                               .replace('b%C3%BCcher', 'books')
                                               .replace('radio', 'programs')
                                               .replace('texte', 'articles')
                                               .replace('zeitschrift', 'issues');
                                    });

      const url = '/api/search/' + params;

      if(location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        showError('Die Suche ist beim lokalen Testen nicht verfügbar da sie auf PHP angewiesen ist.')
      } else {
        let request = new XMLHttpRequest();

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
    </script>
  `;

  return layout(data, html, { title: 'Suche' });
};
