const { FACEBOOK, FLICKR, INSTAGRAM, LINKEDIN, X } = require('./icons.js');

module.exports = `
    <footer>
        <div class="footer_inner">
            <div class="general">
                <a class="logo" href="/">
                    <img alt="dérive" src="/logo25.svg">
                </a>
                <a href="/info/#mediadaten">Mediadaten</a>
                <a href="/info/#agb">AGB</a>
                <a href="/info/#kontakt">Kontakt</a>
                <a href="/info/#impressum">Impressum</a>
            </div>
            <div class="order_buttons">
                <a class="call_out_button inverse" href="https://shop.derive.at" target="_blank">
                    Abo bestellen
                </a>
                <a class="call_out_button inverse" href="/newsletter/">
                    Newsletter bestellen
                </a>
            </div>
            <div class="icon_buttons">
                <a href="https://www.instagram.com/derive_urbanize/">
                   ${INSTAGRAM}
                </a>
                <a href="https://x.com/derivemagazin">
                    ${X}
                </a>
                <a href="https://www.facebook.com/derivemagazin/">
                    ${FACEBOOK}
                </a>
                <a href="https://www.linkedin.com/company/derive-stadtforschung">
                    ${LINKEDIN}
                </a>
                <a href="https://www.flickr.com/photos/derivemagazin/">
                    ${FLICKR}
                </a>
            </div>
        </div>
    </footer>
`;
