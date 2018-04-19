const authors = require('../widgets/authors.js'),
      { fullIssueTitle } = require('../widgets/issues/labeling.js'),
      issueTile = require('../widgets/issues/tile.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = data => {
  const latest = data.issuesDescending[0];

  const years = [];
  data.issuesDescending.forEach(issue => {
    const year = issue.year;

    if(years[year]) {
      years[year].push(issue);
    } else {
      years[year] = [issue];
    }
  });

  const latestAuthors = new Set();
  latest.sections.forEach(section =>
    section.articles.forEach(article =>
      article.authors.forEach(author => latestAuthors.add(author))
    )
  );

  const html = `
    <div>
      <div class="feature">
        <div class="feature__image">
          <img src="${latest.cover.written}"/>
        </div>

        <div class="feature__text">
          ${fullIssueTitle(latest)}

          <h1>
            <a href="/zeitschrift/${latest.number}">
              ${latest.title}
            </a>
          </h1>

          ${latest.description ? `
            <div class="generic__margin-vertical">
              ${latest.description.converted}
            </div>
          `:''}

          Mit Beiträgen von:<br/>
          ${authors([...latestAuthors])}<br/><br/>

          ${tags(latest.tags)}

          ${share(latest.title, `https://derive.at/zeitschrift/${latest.number}/`)}
        </div>
      </div>

      ${Object.keys(years).sort((a, b) => b - a).map(year => `
        <hr/>

        <h2>${year}</h2>

        <div class="tiles__magazine">
          ${years[year].map(issueTile).join('')}
        </div>
      `).join('')}

    </div>
  `;

  return layout(data, html, { activeSection: 'Zeitschrift', title: 'Zeitschrift' });
};
