const authors = require('../widgets/authors.js');
const { fullIssueTitle } = require('../widgets/issues/labeling.js');
const layout = require('./layout.js');
const section = require('../widgets/issues/section.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');

module.exports = (data, issue) => {
  const issueAuthors = new Set();
  issue.sections.forEach(section =>
    section.articles.forEach(article =>
      article.authors.forEach(author => issueAuthors.add(author))
    )
  );

  const html = `
    <div>
      <div class="generic__featured">
        <div class="generic__featured_image">
          <img src="${issue.cover.written}">
        </div>

        <div class="generic__featured_text">
          ${fullIssueTitle(issue)}

          <h1>
            <a href="/zeitschrift/${issue.permalink}/">
              ${issue.title}
            </a>
          </h1>

          ${issue.description ? `
            <div class="generic__margin_vertical">
              ${issue.description.converted}
            </div>
          `:''}

          Mit Beiträgen von:<br>
          ${authors([...issueAuthors].sort((a, b) => a.name.localeCompare(b.name)))}<br><br>

          ${tags(issue.tags)}

          ${share(issue.title, `https://derive.at/zeitschrift/${issue.permalink}/`)}
        </div>
      </div>

      ${issue.sections.map(section).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Zeitschrift', title: `dérive N° ${issue.number}` });
};
