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

      <div class="subtitle">
        ${event.subtitle}
      </div>

      <div class="additional">
        ${timeframe(event)}
        &nbsp;
        ${event.address}
      </div>

      <div class="additional">
        ${event.additionalInfo}
      </div>

      <p>
        ${event.abstract}
      </p>

      <hr/>

      <div>
        ${event.text ? event.text.written : ''}
      </div>

      <hr/>

      ${categories(event.categories)}
      ${tags(event.tags)}

      ${addThis(`/veranstaltungen/${event.permalink}/`)}
    </div>
  `;

  return layout(html, urbanize, { title: event.title });
};
