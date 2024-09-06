const layout = require('./layout.js');
const { SECTION_AUTHORS } = require('../widgets/header.js');

module.exports = (data) => {
    const { authorsPaginated } = data;

    const html = `
        <div>
            <div class="author_split">
                <div></div>
                <div>
                    <h1 class="heading">Autor:innen</h1>
                </div>
            </div>
            <div class="pagination">
                ${authorsPaginated.map(pagination => `<a href="#${pagination.label}">${pagination.label}</a>`).join('')}
            </div>
            ${authorsPaginated.map(pagination => `
                <div class="author_split">
                    <div>
                        <a class="displaced_anchor" id="${pagination.label}"></a>
                        <span>${pagination.label}</span>
                    </div>
                    <div>
                        ${pagination.authors.map(author => `
                            <div>
                                <a href="/autorinnen/${author.permalink}/">
                                    ${author.firstName && author.lastName ? `${author.lastName}, ${author.firstName}` : author.name}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    return layout(data, html, { section: SECTION_AUTHORS, title: 'Autor:innen' });
};
