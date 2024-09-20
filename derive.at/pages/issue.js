const { authors } = require('../widgets/authors.js');
const { fullIssueTitle, issueSection } = require('../widgets/issues.js');
const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { SECTION_MAGAZINE } = require('../widgets/header.js');

module.exports = (data, issue) => {
    const issueAuthors = new Set();
    issue.sections.forEach(section =>
        section.articles.forEach(article =>
            article.authors.forEach(author => issueAuthors.add(author))
        )
    );

    const html = `
        <div>
            <div class="featured">
                <div class="featured_image">
                    <img src="${issue.cover.written}">
                </div>
                <div class="featured_text">
                    <div class="subheading">
                        ${fullIssueTitle(issue)}
                    </div>

                    <h1 class="big_heading">
                        <a href="/zeitschrift/${issue.permalink}/">
                            ${issue.title}
                        </a>
                    </h1>

                    ${issue.description ? `
                        <div class="font_size_1_1 vertical_margin">
                            ${issue.description.converted}
                        </div>
                    `:''}

                    <div class="call_out_buttons_spaced font_size_1_1 vertical_margin">
                        <a class="call_out_button" href="#inhaltsverzeichnis">
                            Inhaltsverzeichnis
                        </a>
                        <a class="call_out_button" href="${issue.shopLink}">
                            Heft kaufen
                        </a>
                    </div>

                    <div class="smaller_font vertical_margin">
                        <strong>Mit Beiträgen von:</strong>
                        ${authors([...issueAuthors].sort((a, b) => a.name.localeCompare(b.name)))}
                    </div>

                    ${tags(issue.tags)}
                </div>
            </div>
            <a class="displaced_anchor" id="inhaltsverzeichnis"></a>
            <div class="section_article_split">
                <div class="subheading">Inhalt</div>
            </div>
            ${issue.sections.map(issueSection).join('')}
        </div>
    `;

    return layout(data, html, { section: SECTION_MAGAZINE, title: `dérive N° ${issue.number}` });
};
