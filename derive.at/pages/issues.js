const layout = require('./layout.js'),
      authors = require('../widgets/authors.js'),
      { formattedQuarter, fullIssueTitle } = require('../widgets/issue-labeling.js'),
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
      article.connected.authors.connected.forEach(author => latestAuthors.add(author))
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
              ${latest.description}
            </div>
          `:''}

          Mit Beiträgen von:<br/>
          ${authors([...latestAuthors])}<br/><br/>

          ${tags(latest.tags.connected)}

          ${share(latest.title, `https://derive.at/zeitschrift/${latest.number}/`)}
        </div>
      </div>

      ${Object.keys(years).sort((a, b) => b - a).map(year => `
        <hr/>

        ${year}

        <div class="tiles__magazine">
          ${years[year].map(issue => `
            <div class="tile__magazine">
              <div class="tile__magazine__cover">
                <div class="desktop-overlay">
                  <div class="number">dérive N<sup>o</sup> ${issue.number}</div>
                  <div class="quarter">${formattedQuarter[issue.quarter]}</div>
                  <div class="title">${issue.title}</div>
                  <a class="view" href="/zeitschrift/${issue.number}/">Ansehen</a>
                  ${issue.shopLink ? `
                    <a class="buy" href="${issue.shopLink}">Kaufen</a>
                  `:''}
                </div>

                <img src="${issue.cover.written}"/>
              </div>

              <div class="tile__magazine__label">
                <strong>N<sup>o</sup> ${issue.number}</strong><br/>
                ${issue.title}
              </div>
            </div>
          `.trim()).join('')}
        </div>
      `).join('')}

    </div>
  `;

  return layout(data, html, { activeSection: 'Zeitschrift', title: 'Zeitschrift' });
};
