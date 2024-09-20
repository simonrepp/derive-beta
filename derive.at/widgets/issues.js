const FORMATTED_QUARTER = {
    1: 'Jän - Mär',
    2: 'Apr - Juni',
    3: 'Juli - Sept',
    4: 'Okt - Dez'
};

function fullIssueTitle(issue) {
    return `
        <a href="/zeitschrift/${issue.permalink}/">
            dérive N° ${issue.number} &nbsp;&nbsp; ${FORMATTED_QUARTER[issue.quarter]} ${issue.year}
        </a>
    `.trim();
}

function issueSection(section) {
    return `
        <hr class="hr__light">
        <div class="section_article_split">
            <div class="subheading">${section.title}</div>
        </div>
        ${section.articles.map(article => `
            <div class="section_article_split">
                <div>
                    Seite ${article.inIssueOnPages}<br>
                    ${article.authors.length > 0 ? `
                        <div class="smaller_font">
                            ${article.authors.map(author =>
                                `<a href="/autorinnen/${author.permalink}/">${author.name}</a>`
                            ).join(',<br>')}
                        </div>
                    `:''}
                </div>
                <div>
                    <strong>
                        <a href="/texte/${article.permalink}/">
                            ${article.title}
                        </a>
                    </strong>
                    <br>
                    ${article.subtitle ? `
                        <a href="/texte/${article.permalink}/">
                            ${article.subtitle}
                        </a>
                        <br>
                    `:''}
                    <a class="accent" href="/texte/${article.permalink}/">
                        ${article.readable && article.text ? 'Artikel lesen' : 'Abstract lesen'}
                    </a>
                </div>
            </div>
        `).join('')}
    `;
}

function issueTile(issue) {
    return `
        <a class="issue_tile" href="/zeitschrift/${issue.permalink}/">
            <div class="issue_tile_cover">
                <div class="issue_tile_overlay"></div>
                <img src="${issue.cover.written}">
            </div>
            <div>
                <strong>N° ${issue.number}</strong><br>
                ${issue.title}
            </div>
        </a>
    `.trim();
}

exports.fullIssueTitle = fullIssueTitle;
exports.issueSection = issueSection;
exports.issueTile = issueTile;
