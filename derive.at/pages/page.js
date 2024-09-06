const layout = require('./layout.js');
const header = require('../widgets/header.js');
const {
    SECTION_ABOUT,
    SECTION_CONTACT,
    SECTION_NEWSLETTER,
    SECTION_PARTNERS,
    SECTION_PROJECTS
} = require('../widgets/header.js');

module.exports = (data, page) => {
    const html = `
        <div class="reading_width">
            ${page.text.written}
        </div>
    `;

    let section;
    if (page.permalink === 'kontakt') {
        section = SECTION_CONTACT;
    } else if (page.permalink === 'newsletter') {
        section = SECTION_NEWSLETTER;
    } else if (page.permalink === 'partnerinnen') {
        section = SECTION_PARTNERS;
    } else if (page.permalink === 'projekte') {
        section = SECTION_PROJECTS;
    } else if (page.permalink === 'ueber-derive') {
        section = SECTION_ABOUT;
    }

    return layout(data, html, { section, title: page.title });
};
