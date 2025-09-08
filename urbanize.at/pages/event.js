const moment = require('moment');
const striptags = require('striptags');

moment.updateLocale('de', {
    monthsShort : [
        'JÄN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
        'JUL', 'AUG', 'SEPT', 'OKT', 'NOV', 'DEZ'
    ]
});

const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');
const signupButton = require('../widgets/signup_button.js');
const timeframe = require('../widgets/timeframe.js');

module.exports = (urbanize, event) => {
    const html = `
        <div>
            <div class="margin_y_2_0">
                ${event.image ? `
                    <img src="${event.image.written}">
                `:''}
                ${event.imageCredits ? `
                    <div class="color_grey font_size_0_8 text_align_right">${event.imageCredits}</div>
                `:''}
            </div>

            ${event.dates.map(date => `
                <div class="flex_split_lr flex_split_collapse_430 margin_y_0_5">
                    <div>
                        <strong class="color_green">${moment(date.date).locale('de').format('dd, D MMM YYYY')}</strong><br>
                        <strong class="color_green">${timeframe(date)}</strong>
                    </div>

                    <div class="margin_y_0_5">
                        ${signupButton(event, date)}
                    </div>
                </div>

                <hr class="hairline">
            `).join('')}

            <div class="flex_split_lr flex_split_collapse_760">
                <div>
                    <strong>${event.venue}</strong><br>
                    <strong>
                        ${event.mapLink ? `<a href="${event.mapLink}" target="_blank">${event.address}</a>` : event.address}
                    </strong>

                    ${event.directions ? `<br><em>${event.directions}</em>` : ''}
                </div>

                <div class="margin_y_0_5">
                    <a class="rounded_rect button_rect_black" href="/programm/?kategorie=${event.category}">
                        ${event.category}
                    </a>
                </div>
            </div>

            <hr class="hairline">

            <h2 style="margin-bottom: 0;">
                <a href="/${event.permalink}/">
                    ${event.title}
                </a>
            </h2>

            <div style="margin-bottom: 1em;">
                <strong>${event.subtitle}</strong>
            </div>

            ${event.text ? `
                <div class="margin_y_0_5">
                    ${event.text.written}
                </div>
            ` : ''}

            ${event.participants.length > 0 ? `
                <div class="margin_y_0_5">
                    <strong>
                        Mit
                        <a href="/${event.participants[0].permalink}/">
                            ${event.participants[0].name}
                        </a>

                        ${event.participants.length >= 3 ? event.participants.slice(1, event.participants.length - 1).map(participant => `
                            ,
                            <a href="/${participant.permalink}/">
                                ${participant.name}
                            </a>
                        `).join('') : ''}

                        ${event.participants.length >= 2 ? `
                            und
                            <a href="/${event.participants[event.participants.length - 1].permalink}/">
                                ${event.participants[event.participants.length - 1].name}
                            </a>
                        ` : ''}
                    </strong>
                </div>
            ` : ''}

            ${event.additionalInfo ? `
                <div class="margin_y_0_5">
                    ${event.additionalInfo.converted}
                </div>
            ` : ''}

            <hr class="hairline">

            ${event.links.length > 0 ? `
                <div class="margin_y_0_5">
                    <strong>Links</strong><br>
                    ${event.links.map(link => `
                            <a href="${link}" target="_blank">${link}</a><br>
                    `).join('')}
                </div>
            ` : ''}

            <hr>

            ${scrollToTop}
        </div>
    `;

    const og = {};

    if(event.image) {
        og.image = urbanize.base_url + event.image.written;
        og.imageWidth = event.image.width;
        og.imageHeight = event.image.height;
    } else if(event.text && event.text.embeds && event.text.embeds.length > 0) {
        og.image = urbanize.base_url + event.text.embeds[0].written;
        og.imageWidth = event.text.embeds[0].width;
        og.imageHeight = event.text.embeds[0].height;
    }

    return layout(html, urbanize, { description: event.abstract ? striptags(event.abstract.converted) : undefined, og: og, title: event.title });
};
