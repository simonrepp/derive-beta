const authors = require('../widgets/authors.js'),
      firstBroadcast = require('../widgets/first-broadcast.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = (data, program) => {
  const html = `
    <div class="featured">

      <div class="featured__image">
        ${program.image ? `<img src="${program.image.written}" />` : ''}
      </div>

      <div class="featured__text">
        ${authors(program.editors)}

        <h1>${program.title}</h1>

        ${program.subtitle ? `
          <strong>${program.subtitle}</strong>
        `:''}

        ${firstBroadcast(program.firstBroadcast)}

        <div class="featured__radio">
          <audio controls
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

        <br/><br/>


        ${tags(program.tags)}

        <hr class="hr__light" />

        ${share(program.title, `/radio/${program.permalink}/`)}
      </div>
    </div>
  `;

  return layout(data, html, { activeSection: 'Radio', title: program.title });
};
