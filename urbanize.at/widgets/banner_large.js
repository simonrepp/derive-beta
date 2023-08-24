const { URBANIZE_YEAR } = require('../config.js');

module.exports = `
    <div class="banner_large">
        <div class="alignment">
            <div class="logo_wrapper">
                <img class="logo_static" src="/images/urbanize_static_white.svg">
            </div>
            <div class="info font_weight_500">
                3—8 OKT ${URBANIZE_YEAR}<br>
                WIEN
            </div>
            <img alt="Around the Corner"
                 sizes="(max-width: 270px) 270px, (max-width: 540px) 540px, 1080px"
                 src="images/sujet_1080.png"
                 srcset="images/sujet_1080.png 1080w, images/sujet_540.png 540w, images/sujet_270.png 270w">
        </div>
    </div>
`;
