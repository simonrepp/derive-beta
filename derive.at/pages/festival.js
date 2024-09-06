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
                <h2>${data.festival.subtitle}</h2>

                <span>
                    ${data.festival.description.converted}
                </span>

                <div class="vertical_margin">
                    <a href="https://urbanize.at">urbanize.at</a>
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
