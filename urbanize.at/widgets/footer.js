const { URBANIZE_YEAR } = require('../config.js');

const DERIVE_INFO = `
  <img class="derive_logo" alt="Logo dérive" src="/images/derive.svg"><br>
  <div class="font_size_1_3">dérive — Verein für Stadtforschung</div>
  <div class="font_size_1_3"><a href="https://derive.at">derive.at</a></div><br><br>

  <a class="button_circle_black font_size_1_6" href="https://facebook.com/derivemagazin/" target="_blank"><span class="icon-facebook"></span></a>
  <a class="button_circle_black font_size_1_6" href="https://twitter.com/derivemagazin" target="_blank"><span class="icon-twitter"></span></a>
  <a class="button_circle_black font_size_1_6" href="https://instagram.com/derive_urbanize/" target="_blank"><span class="icon-instagram"></span></a>
  <a class="button_circle_black font_size_1_6" href="https://vimeo.com/derivestadtforschung" target="_blank"><span class="icon-vimeo"></span></a>
  <a class="button_circle_black font_size_1_6" href="http://flickr.com/photos/derivemagazin" target="_blank"><span class="icon-flickr"></span></a><br><br>

  <span class="font_size_0_8">© ${URBANIZE_YEAR} URBANIZE! INTERNATIONALES FESTIVAL FÜR URBANE ERKUNDUNGEN WIEN</span>
`;

module.exports = urbanize => `
  <div class="footer">
    <div class="alignment">
      <div class="buttons">
        <a class="rounded_rect button_rect_black font_size_1_2" href="/newsletter/">Newsletter</a>
        <a class="rounded_rect button_rect_black font_size_1_2" href="/impressum/">Impressum</a>
      </div>

      <div class="derive_desktop">
        ${DERIVE_INFO}
      </div>

      <div class="archive">
        <div class="label font_size_1_3">Festivalarchiv</div>

        <a href="https://2022.urbanize.at/" target="_blank">urbanize! 2022</a><br>
        <a href="https://2021.urbanize.at/" target="_blank">urbanize! 2021</a><br>
        <a href="https://2020.urbanize.at/" target="_blank">urbanize! 2020</a><br>
        <a href="https://2019.urbanize.at/" target="_blank">urbanize! 2019</a><br>
        <a href="https://2018.urbanize.at/" target="_blank">ur9anize! 2018</a><br>
        <a href="https://2017.urbanize.at/" target="_blank">ur8anize! 2017</a><br>
        <a href="https://2016.urbanize.at/" target="_blank">urbani7e! 2016</a><br>
        <a href="https://2015.urbanize.at/" target="_blank">ur6anize! 2015</a><br>
        <a href="https://2014.urbanize.at/" target="_blank">ur5anize! 2014</a><br>
        <a href="https://2013.urbanize.at/" target="_blank">ur4anize! 2013</a><br>
        <a href="https://2012.urbanize.at/" target="_blank">ur3anize! 2012</a><br>
        <a href="https://2011.urbanize.at/" target="_blank">urbani2e! 2011</a>
      </div>
    </div>

    <div class="derive_mobile">
      ${DERIVE_INFO}
    </div>
  </div>`;
