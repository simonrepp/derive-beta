const { stripAndTruncateHtml } = require('../../derive-common/util.js');

const { authors } = require('./authors.js');
const { fullIssueTitle } = require('./issues.js');
const tags = require('./tags.js');

const infoDetails = article => `
    <strong>Autor:innen</strong><br>
    ${authors(article.authors)}

    <br><br>

    ${article.issue ? `
        <strong>Ausgabe</strong><br>
        <a class="smaller_font"
             href="/zeitschrift/${article.issue.permalink}">
            N°${article.issue.number} (${article.inIssueOnPages === 'Nur online' ? 'Nur online' : `Seite ${article.inIssueOnPages}`})
        </a>

        <br><br>
    `:''}

    ${tags(article.tags)}

    ${article.issue ? `
        <strong>
            <a href="${article.issue.shopLink}">
                Heft kaufen
            </a>
        </strong>
    `:''}
`;

const info = article => `
    <div class="heading">
        <a href="/texte/${article.permalink}/">
            ${article.title}
        </a>
    </div>

    ${article.subtitle ? `
        <div class="subheading">
            <a href="/texte/${article.permalink}/">
                ${article.subtitle}
            </a>
        </div>
    `:''}

    <div class="article-panel__info-split">

        <div class="article-panel__info-cover">
            ${article.image ?
                `<img src="${article.image.written}" ${article.imageCaption ? `alt=${article.imageCaption}" title="${article.imageCaption}"` : ''} >` :
                (article.issue ? `<img src="${article.issue.cover.written}">` : '')}
        </div>

        <div class="article-panel__info-details">
            ${infoDetails(article)}
        </div>
    </div>
`;

function articlePanel(article) {
    return `
        <div class="article-panel">
            <div class="article-panel__info">
                ${info(article)}
            </div>

            <div class="article-panel__abstract">
                ${article.abstract ? article.abstract.converted :
                    (article.text ? stripAndTruncateHtml(article.text.converted, 500, `/texte/${article.permalink}/`) : 'Kein Text vorhanden.')}
            </div>
        </div>
    `;
}

function articleListing(article) {
    return `
        <div class="listing_split">
            <div>
                ${article.issue ? `<img src="${article.issue.cover.written}">` : ''}
            </div>
            <div>
                ${article.issue ? `
                    <div class="subheading">
                        ${fullIssueTitle(article.issue)}
                    </div>
                ` : ''}

                <div class="big_heading no_margin">
                    <a href="/texte/${article.permalink}/">
                        ${article.title}
                    </a>
                </div>
                ${article.subtitle ? `<div>${article.subtitle}</div>`:''}

                ${article.issue ? `
                    <div class="vertical_margin">
                        Seite ${article.inIssueOnPages}
                    </div>
                ` : ''}
                <p>
                    <a class="call_out_button" href="/texte/${article.permalink}/">
                        Artikel lesen
                    </a>
                </p>
            </div>
        </div>
    `;
}

exports.articlePanel = articlePanel;
exports.articleListing = articleListing;
