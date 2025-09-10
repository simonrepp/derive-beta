const { FACEBOOK, FLICKR, INSTAGRAM, LINKEDIN } = require('../../derive-common/icons.js');
const { URBANIZE_YEAR } = require('../config.js');

const DERIVE_INFO = `
    <img class="logo" alt="dérive" src="/images/derive.svg"><br>
    <div class="font_size_1_3">dérive — Verein für Stadtforschung</div>
    <div class="font_size_1_3"><a href="https://derive.at">derive.at</a></div>
    <br><br>
    <a class="button_circle" href="https://www.instagram.com/derive_urbanize/" target="_blank">
       ${INSTAGRAM}
    </a>
    <a class="button_circle" href="https://www.facebook.com/derivemagazin/" target="_blank">
        ${FACEBOOK}
    </a>
    <a class="button_circle" href="https://www.linkedin.com/company/derive-stadtforschung" target="_blank">
        ${LINKEDIN}
    </a>
    <a class="button_circle" href="https://www.flickr.com/photos/derivemagazin/" target="_blank">
        ${FLICKR}
    </a>
    <br><br>
    <span class="font_size_0_8">© ${URBANIZE_YEAR} URBANIZE! INTERNATIONALES FESTIVAL FÜR URBANE ERKUNDUNGEN WIEN</span>
`;

module.exports = urbanize => `
    <footer>
        <div class="alignment">
            <div class="buttons">
                <a href="/newsletter/">
                    Newsletter
                </a>
                <a href="/impressum/">
                    Impressum
                </a>
            </div>
            <div class="derive_desktop">
                ${DERIVE_INFO}
            </div>
            <details class="archive">
                <summary>Festivalarchiv</summary>
                <div>
                    <a href="https://2024.urbanize.at/" target="_blank">urbanize! 2024</a>
                    <a href="https://2023.urbanize.at/" target="_blank">urbanize! 2023</a>
                    <a href="https://2022.urbanize.at/" target="_blank">urbanize! 2022</a>
                    <a href="https://2021.urbanize.at/" target="_blank">urbanize! 2021</a>
                    <a href="https://2020.urbanize.at/" target="_blank">urbanize! 2020</a>
                    <a href="https://2019.urbanize.at/" target="_blank">urbanize! 2019</a>
                    <a href="https://2018.urbanize.at/" target="_blank">ur9anize! 2018</a>
                    <a href="https://2017.urbanize.at/" target="_blank">ur8anize! 2017</a>
                    <a href="https://2016.urbanize.at/" target="_blank">urbani7e! 2016</a>
                    <a href="https://2015.urbanize.at/" target="_blank">ur6anize! 2015</a>
                    <a href="https://2014.urbanize.at/" target="_blank">ur5anize! 2014</a>
                    <a href="https://2013.urbanize.at/" target="_blank">ur4anize! 2013</a>
                    <a href="https://2012.urbanize.at/" target="_blank">ur3anize! 2012</a>
                    <a href="https://2011.urbanize.at/" target="_blank">urbani2e! 2011</a>
                </div>
            </details>
        </div>
        <div class="derive_mobile">
            ${DERIVE_INFO}
        </div>
    </footer>
`;
