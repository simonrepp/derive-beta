const editors = require('../widgets/editors.js'),
      firstBroadcast = require('../widgets/first-broadcast.js'),
      layout = require('./layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

module.exports = program => {
  const html = `
    <div class="feature">

      <div class="feature__image">
        ${program.image ? `<img src="${program.image.written}" />` : ''}
      </div>

      <div class="feature__text">
        <!-- TODO without header, see https://derive.rowild.at/radio-single.html -->
        ${editors(program.editors.connected)}

        <h1>${program.title}</h1>

        ${program.subtitle ? `
          <strong>${program.subtitle}</strong>
        `:''}

        ${firstBroadcast(program.firstBroadcast)}

        <audio controls src="${program.soundfile.written}"></audio>

        <br/><br/>


        ${tags(program.tags.connected)}

        <hr class="hr__light" />

        ${share(program.title, `/radio/${program.permalink}/`)}
      </div>
    </div>
  `;

  return layout(html, { activeSection: 'Radio', title: program.title });
};
