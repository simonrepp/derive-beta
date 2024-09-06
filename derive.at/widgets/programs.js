const moment = require('moment');

const { stripAndTruncateHtml } = require('../../derive-common/util.js');

function editors(authors) {
    return authors.length > 0 ? `
        <div class="subheading">
            Redaktion:
            ${authors.map(editor => `
                <a href="/autorinnen/${editor.permalink}/">${editor.name}</a>
            `.trim()).join(', ')}
        </div>
    ` : '';
}

function firstBroadcast(firstBroadcastDate) {
    return `
        <div class="vertical_margin">
            <strong>Erstaustrahlung</strong><br>
            ${moment(firstBroadcastDate).locale('de').format('Do MMMM YYYY')}
        </div>
    `;
}

function programListing(program) {
    return `
        <div class="listing_split">
            <div>
                ${program.image ? `
                    <img src="${program.image.written}"
                             ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} >
                `:''}
            </div>
            <div>
                ${editors(program.editors)}
                <div class="big_heading no_margin">
                    <a href="/radio/${program.permalink}/">
                        ${program.title}
                    </a>
                </div>
                ${program.subtitle ? `<strong>${program.subtitle}</strong>`:''}
                ${firstBroadcast(program.firstBroadcast)}
                <div class="font_size_1_25 vertical_margin">
                    ${program.abstract ?
                        program.abstract.converted:
                        (program.text ?
                            stripAndTruncateHtml(program.text.converted, 500, `/radio/${program.permalink}/`) :
                            '')}
                </div>
                <a class="call_out_button" href="/radio/${program.permalink}/">
                    Zur Sendung
                </a>
            </div>
        </div>
    `;
}

exports.editors = editors;
exports.firstBroadcast = firstBroadcast;
exports.programListing = programListing;
