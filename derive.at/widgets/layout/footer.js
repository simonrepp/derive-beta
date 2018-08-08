module.exports = () => `
  <hr/>

  <div class="generic__margin-vertical">

    <footer class="footer">
      <div>
        <a href="/impressum/">Über dérive</a><br/>
        <a href="/medieninformationen/">Medieninformationen</a><br/>
        <a href="/kooperationen/">Kooperationen</a><br/>
        <a href="/impressum/">Kontakt / Impressum</a><br/>
      </div>

      <div class="footer__inserts"></div>

      <div>
        <!-- TODO: Generic share on facebook implementation (prerenderer w/o javascript?) - open in tab instead of window (mobile consideration mostly) -->

        <a class="a__no-underline"
           href="http://www.facebook.com/sharer/sharer.php?u=www.derive.at&title=derive"
           title="dérive auf facebook teilen">
         <span class="icon-facebook"></span>
        </a>

        <a class="a__no-underline"
           href="https://twitter.com/intent/tweet?status=Derive"
           title="Über dérive tweeten">
          <span class="icon-twitter"></span>
        </a>

        <a class="a__no-underline"
           href="https://www.flickr.com/photos/derivemagazin/"
           title="dérive auf flickr">
          <span class="icon-flickr"></span>
        </a>

        <a class="a__no-underline"
           href="https://www.youtube.com/user/derivemagazin"
           title="dérive auf YouTube">
          <span class="icon-youtube"></span>
        </a>

        <a class="a__no-underline"
           href="https://vimeo.com/derivestadtforschung"
           title="dérive auf Vimeo">
          <span class="icon-vimeo"></span>
        </a>

        <br/>

        <a href="http://eepurl.com/fmHIo" target="_blank">
          Newsletter bestellen
        </a>

      </div>
    </footer>

  </div>
`;
