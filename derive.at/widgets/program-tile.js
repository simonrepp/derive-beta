const editors = require('../widgets/editors.js'),
      firstBroadcast = require('../widgets/first-broadcast.js');

module.exports = program => `
  <div class="tile">
    <div class="tile_header">
      <a href="/radio/${program.permalink}/">
        ${program.title}
      </a>
    </div>

    <div class="tile_image_split">
      <div class="tile_image_split__image">
        ${program.image ? `
          <img src="${program.image.written}"
               ${program.imageCaption ? `alt=${program.imageCaption}" title="${program.imageCaption}"` : ''} />
        `:''}
      </div>

      <div class="tile_image_split__meta">
        ${program.subtitle ? `
          <strong>
            <a href="/radio/${program.permalink}/">
              ${program.subtitle}
            </a>
          </strong>
        `:''}

        ${editors(program.editors)}

        ${firstBroadcast(program.firstBroadcast)}
      </div>
    </div>
  </div>
`;
