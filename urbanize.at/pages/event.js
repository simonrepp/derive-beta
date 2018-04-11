const addThis = require('../widgets/add-this.js'),
      categories = require('../widgets/categories.js'),
      tags = require('../widgets/tags.js'),
      timeframe = require('../widgets/timeframe.js');

module.exports = (urbanize, event) => {
  const html = `
    <div>
      <div class="breadcrumb">
        <a href="/">
          Home
        </a>
        <span> › </span>
        <a href="/events/">
          Programm
        </a>
        <span> › </span>
        ${event.title}
      </div>

      <div class="title">
        ${event.title}
      </div>

      ${event.subtitle ? `
        <div class="subtitle">
          ${event.subtitle}
        </div>
      `:''}

      <div class="additional">
        ${timeframe(event)}
        &nbsp;
        ${event.address}
      </div>

      <div class="additional">
        ${event.additionalInfo ? event.additionalInfo.sourced : ''}
      </div>

      ${event.abstract ? `
        <p>
          ${event.abstract.sourced}
        </p>
      `:''}


      ${event.text ? `
        <hr/>

        <div>
           ${event.text.written}
        </div>
      `:''}

      <hr/>

      ${categories(event.categories.connected)}
      ${tags(event.tags.connected)}

      ${addThis(`/veranstaltungen/${event.permalink}/`)}
    </div>
  `;

  return layout(html, urbanize, { title: event.title });
};
