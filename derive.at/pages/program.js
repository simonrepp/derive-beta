const { editors, firstBroadcast } = require('../widgets/programs.js');
const layout = require('./layout.js');
const tags = require('../widgets/tags.js');
const { SECTION_RADIO } = require('../widgets/header.js');

module.exports = (data, program) => {
    const html = `
        <div class="featured">
            <div class="featured_image">
                ${program.image ?
                    `<img src="${program.image.written}"
                                ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} >`
                :''}
                ${program.imageCaption ? `<small>${program.imageCaption}</small>` : ''}
            </div>
            <div class="featured_text">
                ${editors(program.editors)}
                <h1 class="big_heading no_margin">${program.title}</h1>
                ${program.subtitle ? `<strong>${program.subtitle}</strong>` : ''}
                ${firstBroadcast(program.firstBroadcast)}
                ${tags(program.tags)}
                ${program.soundfile ? `
                    <div class="radio">
                        <audio class="radio__audio" preload="none" src="${program.soundfile.written}"></audio>
                        <a class="radio__button">
                            <span class="radio__playback_icon icon-play"></span>
                        </a>
                        <div class="radio__seekbar">
                            <div class="radio__seekbar_progress"></div>
                            <div class="radio__seekbar_text"></div>
                        </div>
                    </div>
                ` : ''}
                <div class="vertical_margin">
                    ${program.text ?
                        program.text.written :
                        (program.abstract ?
                            program.abstract.converted :
                            '')}
                </div>
            </div>
        </div>
    `;

    const extraScript = program.soundfile ? 'radio.js' : null;

    return layout(data, html, { section: SECTION_RADIO, extraScript, title: program.title });
};
