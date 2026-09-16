const {
    URBANIZE_SLOGAN,
    URBANIZE_TIMEFRAME,
    URBANIZE_YEAR
} = require('../config.js');

const largeBanner = `
    <div class="banner_large">
        <div class="alignment">
            <div class="free_entry">
                <span>EINTRITT<br>FREI!</span>
                <svg width="var(--star-edge)" height="var(--star-edge)" version="1.1" viewBox="0 0 74.931 74.85" xmlns="http://www.w3.org/2000/svg">
                    <path d="m71.177 20.851-9.434 0.54984 4.2802-8.4239-9 2.8787 2.0505-9.2246-8.0023 5.0257-0.3073-9.4437-6.5002 6.8585-2.6458-9.0716-4.5916 8.2586-4.819-8.1277-2.3923 9.1419-6.689-6.6738-0.0441 9.4492-8.1387-4.8011 2.3068 9.1626-9.0771-2.6252 4.5144 8.3013-9.4451-0.28526 6.4368 6.9178-9.2205 2.0726 7.9554 5.1001-8.4143 4.2981 8.9724 2.9628-7.0804 6.2563 9.4285 0.63803-5.3027 7.8204 9.2894-1.7267-3.1902 8.8939 8.5686-3.9839-0.87919 9.4079 7.3091-5.989 1.4883 9.3321 5.5907-7.6192 3.762 8.6679 3.5195-8.7698 5.8002 7.4593 1.2278-9.3679 7.4731 5.7822-1.141-9.3803 8.6761 3.7428-3.4382-8.8015 9.3348 1.4676-5.519-7.6702 9.4065-0.89986-7.2526-6.0579 8.887-3.2108-8.5314-4.0624 7.8094-5.3206-9.2728-1.8135z"/>
                </svg>
            </div>
            <img class="logo_static" src="/images/urbanize_static_alternate.svg">
            <div class="info font_weight_500">
                <span>${URBANIZE_TIMEFRAME} ${URBANIZE_YEAR}</span> <span>WIEN</span>
            </div>
        </div>
    </div>
    <img alt="${URBANIZE_SLOGAN}"
         sizes="(max-width: 270px) 270px, (max-width: 540px) 540px, (max-width: 1080px) 1080px, 1920px"
         src="images/sujet_1920.png"
         srcset="images/sujet_1920.png 1920w, images/sujet_1080.png 1080w, images/sujet_540.png 540w, images/sujet_270.png 270w">
`;

// variant can be 'standard' (on almost all pages) or 'alternate' (on the newsletter page)
const smallBanner = variant => `
    <div>
        <div class="banner_small banner_small_${variant}">
            <a class="logo_wrapper" href="/">
                <img class="logo_static" src="/images/urbanize_static_${variant}.svg">
            </a>
            <img alt="${URBANIZE_SLOGAN}" class="slogan" src="/images/slogan_${variant}.png">
            <div class="info font_size_1_2 font_weight_500">
                ${URBANIZE_TIMEFRAME} ${URBANIZE_YEAR}<br>
                WIEN
            </div>
        </div>
    </div>
`;

exports.largeBanner = largeBanner;
exports.smallBanner = smallBanner;
