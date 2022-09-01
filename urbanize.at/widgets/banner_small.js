const { URBANIZE_YEAR } = require('../config.js');

module.exports = variant => `
    <div>
        <div class="banner_small banner_small_${variant}">
            <a class="logo_wrapper" href="/">
                <img class="logo_static" src="/images/urbanize_static_${variant}.svg">
            </a>
            <img class="slogan" src="/images/strategien_des_wandels_${variant === 'white' ? 'yellow' : variant}.svg">
            <div class="info font_size_1_2 font_weight_500">
                06—10 OKT ${URBANIZE_YEAR}<br>
                Wien—Nordwestbahnhof
            </div>
        </div>
    </div>
`;
