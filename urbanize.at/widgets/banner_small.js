module.exports = variant => `
  <div>
    <div class="banner_small_${variant}">
      <a class="logo_wrapper" href="/">
        <div class="logo" style="background-image: url('/images/urbanize_sprite_${variant}.svg?final');"></div>
        <img class="tagline" src="/images/tagline_${variant}.svg">
      </a>
      <img class="slogan" src="/images/common_spaces_hybrid_places_${variant === 'white' ? 'yellow' : variant}.svg">
      <div class="info font_size_1_2 font_weight_500">
        06—10 OKT 2021<br>
        Wien—Nordwestbahnhof
      </div>
    </div>
  </div>
`;
