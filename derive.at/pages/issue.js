const layout = require('./layout.js'),
      authors = require('../widgets/authors.js'),
      { formattedQuarter, fullIssueTitle } = require('../widgets/issue-labeling.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, issue) => {
  const issueAuthors = new Set();
  issue.sections.forEach(section =>
    section.articles.forEach(article =>
      article.connected.authors.connected.forEach(author => issueAuthors.add(author))
    )
  );

  const html = `
    <div>
      <div class="feature">
        <div class="feature__image">
          <img src="${issue.cover.written}"/>
        </div>

        <div class="feature__text">
          ${fullIssueTitle(issue)}

          <h1>
            <a href="/zeitschrift/${issue.number}">
              ${issue.title}
            </a>
          </h1>

          ${issue.description ? `
            <div class="generic__margin-vertical">
              ${issue.description.sourced}
            </div>
          `:''}

          Mit Beiträgen von:<br/>
          ${authors([...issueAuthors])}<br/><br/>

          ${tags(issue.tags.connected)}

          ${share(issue.title, `https://derive.at/zeitschrift/${issue.number}/`)}
        </div>
      </div>

      ${issue.sections.map(section => `
        <hr class="hr__light" />

        <h1>${section.title}</h1>

        ${section.articles.map(article => `
          ${authors(article.connected.authors.connected)}<br/>
          Seite: ${article.pages}<br/>
          <a href="/texte/${article.connected.permalink}/">Artikel lesen</a>
          <h2>
            <a href="/texte/${article.connected.permalink}/">
              ${article.connected.title}
            </a>
          </h2>
          ${article.connected.subtitle ? `
            <h3>
              <a href="/texte/${article.connected.permalink}/">
                ${article.connected.subtitle}
              </a>
            </h3>
          `:''}
        `).join('')}
      `).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Zeitschrift', title: `dérive N° ${issue.number}` });
};
