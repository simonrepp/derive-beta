const authors = require('../widgets/authors.js'),
      firstBroadcast = require('../widgets/first-broadcast.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, program) => {
  const html = `
    <div class="generic__featured">

      <div class="generic__featured_image">
        ${program.image ?
          `<img src="${program.image.written}"
                ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} />`
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

        <div class="featured__radio">
          <audio controls
                 controlsList="nodownload"
                 data-title="${program.title}"
                 src="${program.soundfile.written}">
          </audio>
        </div>

        <div class="radio__notice">
          Die Radiosendung spielt im Hintergrund weiter, du kannst dich während
          dem zuhören frei durch die Seite bewegen. Eine Button zum pausieren
          bzw. anschliessendem weiterführen der Wiedergabe wurde in der
          Seitenleiste hinzugefügt und ist jederzeit verfügbar.
        </div>

        <div class="generic__margin_vertical">
          ${program.abstract ? program.abstract.converted : ''}
        </div>

        ${tags(program.tags)}

        ${share(program.title, `/radio/${program.permalink}/`)}
      </div>
    </div>

    <hr/>

    <div class="generic__serif">
      ${program.text ? program.text.written : ''}
    </div>
  `;

  return layout(data, html, { activeSection: 'Radio', title: program.title });
};
