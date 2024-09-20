const layout = require('./layout.js');
const { SECTION_FESTIVAL } = require('../widgets/header.js');

module.exports = data => {
    const html = `
        <div class="featured">

            <div class="featured_image">
                <img src="${data.festival.image.written}">
            </div>

            <div class="featured_text">
                <h1>${data.festival.title}</h1>
                <div class="subheading">${data.festival.subtitle}</div>

                <div class="font_size_1_1 vertical_margin">
                    ${data.festival.description.converted}
                </div>

                <div class="font_size_1_1 vertical_margin">
                    <a class="call_out_button" href="https://urbanize.at">Zum Festival</a>
                </div>
            </div>
        </div>

        <h2 class="generic__center_aligned">
            Festivals der letzten Jahre
        </h2>

        <div class="tiles">
            ${data.festival.editions.map(edition => `
                <div class="tile tile--festival">
                    <a href="${edition.url}" target="_blank">
                        <img src="${edition.image.written}">
                    </a>
                </div>
            `).join('')}
        </div>
    `;

    return layout(data, html, { section: SECTION_FESTIVAL, title: `${data.festival.title} ${data.festival.subtitle}` });
};
