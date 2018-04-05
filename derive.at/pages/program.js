const authors = require('../widgets/authors.js'),
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
        <h1>${program.title}</h1>
        <strong>${program.subtitle}</strong>

        <audio controls src="${program.soundfile.written}"></audio>

        <br/><br/>

        <div class="generic__margin-vertical">
          <strong>Redaktion</strong>
          ${authors(program.editors.connected)}
        </div>

        ${tags(program.tags.connected)}

        <hr class="hr__light" />

        ${share(program.title, `/radio/${program.permalink}/`)}
      </div>
    </div>
  `;

  return layout(html, { activeSection: 'Radio', title: program.title });
};
