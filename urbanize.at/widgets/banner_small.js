module.exports = variant => `
  <div>
    <div class="banner_small_${variant}">
      <a class="logo_wrapper" href="/">
        <div class="logo" style="background-image: url('/images/urbanize_sprite_${variant}.svg');"></div>
        <img class="tagline" src="/images/tagline_${variant}.svg">
      </a>
      <img class="slogan" src="/images/alle_tage_wohnungsfrage_${variant}.svg">
      <div class="info font_size_1_2 font_weight_500">
        9—13 OKT 2019<br>
        Wien—Favoriten
      </div>
    </div>
  </div>
`;
