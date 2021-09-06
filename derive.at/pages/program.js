const authors = require('../widgets/authors.js');
const firstBroadcast = require('../widgets/first-broadcast.js');
const layout = require('./layout.js');
const share = require('../widgets/share.js');
const tags = require('../widgets/tags.js');

module.exports = (data, program) => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        ${program.image ?
          `<img src="${program.image.written}"
                ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} >`
        :''}
        ${program.imageCaption ? `<small>${program.imageCaption}</small>` : ''}
      </div>

      <div class="generic__featured_text">
        ${authors(program.editors)}

        <h1>${program.title}</h1>

        ${program.subtitle ? `
          <strong>${program.subtitle}</strong>
        `:''}

        ${firstBroadcast(program.firstBroadcast)}

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
        `:''}

        <div class="generic__margin_vertical">
          ${program.abstract ? program.abstract.converted : ''}
        </div>

        ${tags(program.tags)}

        ${share(program.title, `https://derive.at/radio/${program.permalink}/`)}
      </div>
    </div>

    <hr>

    <div class="generic__serif">
      ${program.text ? program.text.written : ''}
    </div>
  `;

  const extraScript = program.soundfile ? 'radio.js' : null;

  return layout(data, html, { activeSection: 'Radio', extraScript, title: program.title });
};
