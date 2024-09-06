const { authorsSmall } = require('../widgets/authors.js');
const { fullIssueTitle, issueTile } = require('../widgets/issues.js');
const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { SECTION_MAGAZINE } = require('../widgets/header.js');

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
            <div class="featured">
                <div class="featured_image_wide">
                    <img src="${latest.cover.written}">
                </div>

                <div class="featured_text">
                    <div class="subheading">
                        ${fullIssueTitle(latest)}
                    </div>

                    <h1 class="big_heading">
                        <a href="/zeitschrift/${latest.permalink}">
                            ${latest.title}
                        </a>
                    </h1>

                    ${latest.description ? `
                        <div class="font_size_1_25 vertical_margin">
                            ${latest.description.converted}
                        </div>
                    `:''}

                    <div class="call_out_buttons_spaced font_size_1_25 vertical_margin">
                        <a class="call_out_button" href="/zeitschrift/${latest.permalink}">
                            Weiterlesen
                        </a>
                        <a class="call_out_button" href="${latest.shopLink}">
                            Heft kaufen
                        </a>
                    </div>

                    <div class="vertical_margin">
                        <strong>Mit Beiträgen von:</strong>
                        ${authorsSmall([...latestAuthors].sort((a, b) => a.name.localeCompare(b.name)))}
                    </div>

                    ${tags(latest.tags)}
                </div>
            </div>

            ${Object.keys(years).sort((a, b) => b - a).map(year => `
                <hr>

                <strong style="display: block; margin-bottom: .5rem; margin-top: 1rem;">${year}</strong>

                <div class="tiles__magazine">
                    ${years[year].map(issueTile).join('')}
                </div>
            `).join('')}

        </div>
    `;

    return layout(data, html, { section: SECTION_MAGAZINE, title: 'Zeitschrift' });
};
