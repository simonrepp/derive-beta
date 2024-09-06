const { URBANIZE_SLOGAN, URBANIZE_YEAR } = require('../config.js');

const largeBanner = `
    <div class="banner_large">
        <div class="alignment">
            <img class="logo_static" src="/images/urbanize_static_purple.svg">
            <div class="info font_weight_500">
                <span>8—13 OKT ${URBANIZE_YEAR}</span> <span>WIEN</span>
            </div>
            <img alt="${URBANIZE_SLOGAN}"
                 sizes="(max-width: 270px) 270px, (max-width: 540px) 540px, 1080px"
                 src="images/sujet_1080.png"
                 srcset="images/sujet_1080.png 1080w, images/sujet_540.png 540w, images/sujet_270.png 270w">
        </div>
    </div>
`;

const smallBanner = variant => `
    <div>
        <div class="banner_small banner_small_${variant}">
            <a class="logo_wrapper" href="/">
                <img class="logo_static" src="/images/urbanize_static_${variant}.svg">
            </a>
            <img alt="${URBANIZE_SLOGAN}" class="slogan" src="/images/slogan_${variant}.svg">
            <div class="info font_size_1_2 font_weight_500">
                8—13 OKT ${URBANIZE_YEAR}<br>
                WIEN
            </div>
        </div>
    </div>
`;

exports.largeBanner = largeBanner;
exports.smallBanner = smallBanner;
