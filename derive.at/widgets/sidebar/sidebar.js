const issue = require('./issue.js'),
      navigation = require('./navigation.js'),
      search = require('./search.js');

module.exports = data => `
  <div class="sidebar">
    <div class="sidebar__item">
      <a class="sidebar__link sidebar__widget-toggle">
        <span class="icon-menu"></span>
      </a>

      <div class="sidebar__widget">
        ${navigation}
      </div>
    </div>

    <div class="sidebar__item">
      <a class="sidebar__link sidebar__link__search sidebar__widget-toggle">
        <span class="icon-search"></span>
      </a>

      <div class="sidebar__widget">
        ${search}
      </div>
    </div>

    <a class="sidebar__link"
       href="https://derive.tictail.com/"
       target="_blank" >
      <span class="icon-kiosk"></span>
    </a>

    <a class="sidebar__link"
       href="http://eepurl.com/fmHIo"
       target="_blank" >
      <span class="icon-mail"></span>
    </a>

    <div class="sidebar__item">
      <a class="sidebar__link sidebar__link__edition sidebar__widget-toggle">
        N°<br/>
        ${data.issuesDescending[0].number}
      </a>

      <div class="sidebar__widget">
        ${issue(data.issuesDescending[0])}
      </div>
    </div>

    <a class="sidebar__link sidebar__link__playback sidebar__link--disabled"
       data-turbolinks-permanent
       id="sidebar-radio-permanent">
      <span class="sidebar__playback-icon icon-play"></span>
    </a>

    <a class="sidebar__link sidebar__link__top">
      <span class="icon-top"></span>
    </a>
  </div>
`;
