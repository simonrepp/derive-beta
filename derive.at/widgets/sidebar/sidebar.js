const navigation = require('./navigation.js');
const search = require('./search.js');

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

    <a class="sidebar__link sidebar__link__edition"
       href="/zeitschrift/${data.issuesDescending[0].number}">
      N°<br/>
      ${data.issuesDescending[0].number}
    </a>

    <a class="sidebar__link sidebar__link_playback sidebar__link_disabled"
       data-turbolinks-permanent
       id="sidebar-radio-permanent">
      <span class="sidebar__playback_icon icon-play"></span>
    </a>

    <a class="sidebar__link sidebar__link__top">
      <span class="icon-top"></span>
    </a>
  </div>
`;
