const layout = require('../layout.js');

module.exports = () => {
  const html = `
    <div>
      <h1>Suche</h1>

      <div class="results">
        Suche läuft ...
      </div>
    </div>

    <script type="text/javascript">

      const showResults = function(results) {
        let html = '';

        Object.keys(results).forEach(function(section) {
          html += '<h1>' + section + '</h1>'
          html += results[section].map(function(entry) {
            return '<div><a href="' + entry.route + '">' + entry.title + '</a></div>'
          }).join('');
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
                                               .replace('bücher', 'books')
                                               .replace('radio', 'programs')
                                               .replace('texte', 'articles')
                                               .replace('zeitschrift', 'issues');
                                    });

      const url = '/api/search/' + params;

      if(location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        showError('Lokales Environment - Die Suche ist nicht verfügbar.')
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

  return layout(html, { title: 'Suche' });
};
