const moment = require('moment');

const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { editors, programListing } = require('../widgets/programs.js');
const { SECTION_RADIO } = require('../widgets/header.js');

const { stripAndTruncateHtml } = require('../../derive-common/util.js');

module.exports = (data, currentPage) => {
    const { programsPaginated } = data;
    const { featured, programs } = currentPage;

    const html = `
        <div class="featured">
            <div class="featured_image">
                <img src="${featured.image.written}">
            </div>
            <div class="featured_text">
                ${editors(featured.editors)}

                <h1 class="big_heading no_margin">
                    <a href="/radio/${featured.permalink}/">${featured.title}</a>
                </h1>

                ${featured.subtitle ? `
                    <strong>${featured.subtitle}</strong>
                ` : ''}

                <div class="font_size_1_25 vertical_margin">
                    ${featured.abstract ?
                        featured.abstract.converted :
                        (featured.text ?
                            stripAndTruncateHtml(featured.text.converted, 500, `/radio/${featured.permalink}/`) :
                            'Kein Text vorhanden.')}
                </div>

                <div class="call_out_buttons_spaced font_size_1_25">
                    <a class="call_out_button" href="/radio/${featured.permalink}/">
                        Zur Sendung
                    </a>
                    <a class="call_out_button" href="/ueber-radio-derive/">
                        Über Radio <span style="text-transform: none;">dérive</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="pagination">
            ${programsPaginated.map(page => `
                <a ${page === currentPage ? 'class="active"' : ''} href="/radio/${page.label}/">${page.label}</a>
            `).join(' / ')}
        </div>
        <div class="listings">
            ${programs.map(program => programListing(program)).join('<hr>')}
        </div>
    `;

    return layout(data, html, { section: SECTION_RADIO, title: 'Radio dérive' });
};
