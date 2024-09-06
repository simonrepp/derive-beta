const moment = require('moment');

const { authors } = require('../widgets/authors.js');
const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { SECTION_MAGAZINE } = require('../widgets/header.js');
const { fullIssueTitle } = require('../widgets/issues.js');
const { stripAndTruncateHtml } = require('../../derive-common/util.js');

module.exports = (data, article) => {
    const html = `
        <div class="featured">
            <div class="featured_image">
                ${article.image ?
                    `<img src="${article.image.written}">` :
                    (article.issue ? `<img src="${article.issue.cover.written}">`: '')}
                ${article.image && article.imageCaption ? `<small>${article.imageCaption}</small>` : ''}
            </div>
            <div class="featured_text">
                ${article.issue ? `
                    <div class="subheading">
                        ${fullIssueTitle(article.issue)}
                    </div>
                ` : ''}

                <div class="vertical_margin">
                    ${authors(article.authors)}
                </div>

                <h1 class="big_heading no_margin">
                    ${article.title}
                </h1>

                ${article.subtitle ? `
                    <strong>${article.subtitle}</strong>
                ` : ''}

                ${tags(article.tags)}

                ${article.readable ?
                    (article.text ?
                        `<div>${article.text.written}</div>` :
                        '<div class="vertical_margin">Kein Text vorhanden</div>')
                 : `
                    <div class="font_size_1_25 vertical_margin">
                        ${article.abstract ?
                            article.abstract.converted :
                            (article.text ?
                                stripAndTruncateHtml(article.text.converted, 500, `/texte/${article.permalink}/`) :
                                'Kein Text vorhanden. Die Zeitschrift mit dem gesamten Artikel kann online im Shop erworben werden!')}
                     </div>
                `}

                ${article.issue ? `
                    <div class="call_out_buttons_spaced font_size_1_25">
                        ${article.issue.shopLink ? `
                            <a class="call_out_button" href="${article.issue.shopLink}">Heft kaufen</a>
                        `:''}
                        <a class="call_out_button" href="/zeitschrift/${article.issue.permalink}">Inhaltsverzeichnis</a>
                    </div>
                ` : ''}

                ${article.authors.length ? `
                    <div class="vertical_margin">
                        <strong>Autor:innen</strong>
                        ${article.authors.map(author =>
                            author.biography ? author.biography.converted : `<p>${author.name}</p>`
                        ).join('')}
                    </div>
                ` : ''}

                ${article.readable && article.bibliography ? `
                    <strong>Literaturliste</strong><br>
                    ${article.bibliography.converted}
                `:''}
            </div>
        </div>

    `;

    return layout(data, html, { section: SECTION_MAGAZINE, title: article.title });
};
