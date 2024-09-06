const { MENU, SEARCH } = require('./icons.js');

const ABOUT = { name: 'About', route: '/ueber-derive/' };
const AUTHORS = { name: 'Autor:innen', route: '/autorinnen/' };
const BOOKS = { name: 'Bücher', route: '/buecher/' };
const CONTACT = { name: 'Kontakt', route: '/info/#kontakt' };
const FESTIVAL = { name: 'urbanize! Festival', route: '/festival/' };
const MAGAZINE = { name: 'Zeitschrift', route: '/zeitschrift/' };
const NEWSLETTER = { name: 'Newsletter', route: '/newsletter/' };
const PARTNERS = { name: 'Partner:innen', route: '/projekte/' };
const PROJECTS = { name: 'Projekte', route: '/projekte/' };
const RADIO = { name: 'Radio', route: '/radio/' };
const SHOP = { name: 'Shop/Abo', route: 'https://shop.derive.at' };
const VIDEO = { name: 'Video', route: 'https://video.derive.at' };

function header(options) {
    const link = (section, mobile = false) => {
        const classes = [];
        if (section === options.section) { classes.push('active'); }
        if (mobile) { classes.push('mobile'); }
        const classAttr = classes.length ? `class="${classes.join(' ')}"` : '';

        const target = section.route.startsWith('https://') ? 'target="_blank"' : '';

        return `<a ${classAttr} href="${section.route}" ${target}>${section.name}</a>`;
    };

    return `
        <header>
            <nav>
                <a class="logo" href="/">
                    <img alt="dérive" src="/logo.svg">
                </a>

                <div class="header_compact_location">
                    ${[
                        options.section ? `» ${options.section.name}` : null,
                        (options.title && !(options.section && options.title == options.section.name)) ? options.title : null
                    ].filter(Boolean).join(' / ')}
                </div>

                ${link(ABOUT)}
                ${link(MAGAZINE)}
                ${link(RADIO)}
                ${link(FESTIVAL)}
                ${link(SHOP)}

                <div class="search">
                    ${SEARCH}
                    <form action="/suche/" autocomplete="off" id="header_searchform">
                        <input autocomplete="off" name="query" type="search">
                    </form>
                </div>

                <div class="extra_nav">
                    <a class="extra_nav_toggle">
                        ${MENU}
                    </a>

                    <div class="extra_nav_widget">
                        ${link(ABOUT, true)}
                        ${link(MAGAZINE, true)}
                        ${link(RADIO, true)}
                        ${link(FESTIVAL, true)}
                        ${link(SHOP, true)}

                        ${link(VIDEO)}
                        <!-- ${link(PROJECTS)} -->
                        ${link(BOOKS)}
                        ${link(AUTHORS)}
                        ${link(PARTNERS)}
                        ${link(CONTACT)}
                        ${link(NEWSLETTER)}
                    </div>
                </div>
            </nav>
        </header>
    `;
}

exports.header = header;
exports.SECTION_ABOUT = ABOUT;
exports.SECTION_AUTHORS = AUTHORS;
exports.SECTION_BOOKS = BOOKS;
exports.SECTION_CONTACT = CONTACT;
exports.SECTION_FESTIVAL = FESTIVAL;
exports.SECTION_MAGAZINE = MAGAZINE;
exports.SECTION_PARTNERS = PARTNERS;
exports.SECTION_PROJECTS = PROJECTS;
exports.SECTION_RADIO = RADIO;
exports.SECTION_SHOP = SHOP;
