const FORMATTED_QUARTER = {
    1: 'Jän - Mär',
    2: 'Apr - Juni',
    3: 'Juli - Sept',
    4: 'Okt - Dez'
};

function articleListing(article) {
    return `
        <div class="listing_split">
            <div>
                ${article.issue ? `<img src="${article.issue.cover.written}">` : ''}
            </div>
            <div>
                ${article.issue ? `
                    <div class="subheading">
                        <a href="/zeitschrift/${article.issue.permalink}/">
                            dérive N° ${article.issue.number} &nbsp;&nbsp; ${FORMATTED_QUARTER[article.issue.quarter]} ${article.issue.year}
                        </a>
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

function authorListing(author) {
    return `
        <div class="listing_split">
            <div></div>
            <div>
                <div class="big_heading">
                    <a href="/autorinnen/${author.permalink}/">${author.name}</a>
                </div>
                ${author.biography ? `
                    <p>${author.biography.converted}</p>
                `:''}
                <a class="call_out_button" href="/autorinnen/${author.permalink}/">Zur Autor:in</a>
            </div>
        </div>
    `;
}

function bookListing(book) {
    return `
        <div class="listing_split">
            <div>
                ${book.cover ? `<img src="${book.cover.written}">`:''}
            </div>
            <div>
                <div class="authors">
                    ${book.authors.map(author =>
                        `<a href="/autorinnen/${author.permalink}/">${author.name}</a>`
                    ).join(', ')}
                </div>
                <div class="heading">
                    <a href="/buecher/${book.permalink}/">
                        ${book.title}
                    </a>
                </div>
                <div class="vertical_margin">
                    ${[
                        book.placeOfPublication ? `${book.placeOfPublication}:` : '',
                        book.publishers.map(publisher => `<a href="/verlage/${publisher.permalink}/">${publisher.name}</a>`).join(', '),
                        book.yearOfPublication ? `(${book.yearOfPublication})` : ''
                    ].join(' ').trim()}
                </div>
                <p>
                    ${bookReviews(book)}
                </p>
            </div>
        </div>
    `;
}

function bookReviews(book) {
    if(book.reviews.length > 1) {
        return `
            <div class="call_out_buttons_spaced">
                ${book.reviews.map((review, index) =>
                    `<a class="call_out_button" href="/texte/${review.permalink}/">Rezension #${index + 1} lesen</a>
                `).join(' ')}
            </div>
        `;
    } else if(book.reviews.length === 1) {
        return `<a class="call_out_button" href="/texte/${book.reviews[0].permalink}/">Rezension lesen</a>`;
    } else {
        return '';
    }
}

function issueListing(issue) {
    return `
        <div class="listing_split">
            <div>
                <img src="${issue.cover.written}">
            </div>
            <div>
                <div class="big_heading no_margin">
                    <a href="/zeitschrift/${issue.permalink}/">dérive N°${issue.number}</a>
                </div>
                <div class="subheading">
                    <a href="/zeitschrift/${issue.permalink}/">${issue.title}</a>
                </div>
                <div class="vertical_margin">
                    ${FORMATTED_QUARTER[issue.quarter]} / ${issue.year}<br>
                    ${issue.outOfPrint ? 'Vergriffen!' : ''}
                </div>
                <a class="call_out_button" href="/zeitschrift/${issue.permalink}">Inhaltsverzeichnis</a>
            </div>
        </div>
    `;
}

function programListing(program) {
    return `
        <div class="listing_split">
            <div>
                ${program.image ? `
                    <img src="${program.image.written}"
                             ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} >
                `:''}
            </div>
            <div>
                ${program.editors.length > 0 ? `
                    <div class="subheading">
                        Redaktion:
                        ${program.editors.map(editor => `
                            <a href="/autorinnen/${editor.permalink}/">${editor.name}</a>
                        `.trim()).join(', ')}
                    </div>
                ` : ''}
                <div class="big_heading no_margin">
                    <a href="/radio/${program.permalink}/">
                        ${program.title}
                    </a>
                </div>
                ${program.subtitle ? `<strong>${program.subtitle}</strong>`:''}
                <div class="vertical_margin">
                    <strong>Erstaustrahlung</strong><br>
                    ${program.firstBroadcast}
                </div>
                <div class="font_size_1_25 vertical_margin">
                    ${program.abstract ?
                        program.abstract.converted:
                        (program.text ?
                            stripAndTruncateHtml(program.text.converted, 500, `/radio/${program.permalink}/`) :
                            '')}
                </div>
                <a class="call_out_button" href="/radio/${program.permalink}/">
                    Zur Sendung
                </a>
            </div>
        </div>
    `;    
}

function renderSearch() {
    const search = new URLSearchParams(window.location.search);
    const query = search.get('begriff');
    const sections = search.get('filter')?.split(',') ??
        ['autorinnen', 'bücher', 'radio', 'texte', 'zeitschrift'];

    const sectionCheckboxes = document.querySelectorAll('span[data-section]');
    for (const checkbox of sectionCheckboxes) {
        const section = checkbox.dataset.section;

        if (sections.includes(section)) {
            checkbox.classList.remove('icon-checkbox');
            checkbox.classList.add('icon-checkbox-checked');
        } else {
            checkbox.classList.remove('icon-checkbox-checked');
            checkbox.classList.add('icon-checkbox');
        }
    }

    document.querySelector('.search_query').innerHTML = query;
    document.querySelector('.search_searchform input[name="query"]').value = query;
    const results = document.querySelector('.search_results');

    if (results) {
        if (!location.hostname.match(/derive\.at/)) {
            results.innerHTML = 'Die Suche ist beim lokalen Testen nicht verfügbar da sie auf PHP angewiesen ist.';
        } else if (query.length < 1) {
            results.innerHTML = 'Mindestens zwei Buchstaben erforderlich.';    
        } else {
            results.innerHTML = 'Suche läuft';
            
            const sectionsMapped = sections.map(section => 
                ({
                    'autorinnen': 'authors',
                    'bücher': 'books',
                    'radio': 'programs',
                    'texte': 'articles',
                    'zeitschrift': 'issues'
                }[section])
            ).join(',');
            
            fetch(`/api/search/?query=${encodeURI(query)}&sections=${sectionsMapped}`)
                .then(response => response.json())
                .then(data => {
                    let html = '';

                    let separate = false;
                    for (const result of data) {
                        if (separate) {
                            html += '<hr>';
                        } else {
                            separate = true;
                        }

                        if (result.hasOwnProperty('article')) {
                            html += articleListing(result.article);
                        } else if (result.hasOwnProperty('author')) {
                            html += authorListing(result.author);
                        } else if (result.hasOwnProperty('book')) {
                            html += bookListing(result.book);
                        } else if (result.hasOwnProperty('issue')) {
                            html += issueListing(result.issue);
                        } else if (result.hasOwnProperty('program')) {
                            html += programListing(result.program);
                        }
                    }

                    results.innerHTML = html;
                })
                .catch(error => {
                    results.innerHTML = `Fehler: ${error}`;
                });
        }
    }
}

window.addEventListener('DOMContentLoaded', renderSearch);
