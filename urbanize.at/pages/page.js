const layout = require('./layout.js');
const scrollToTop = require('../widgets/scroll_to_top.js');

module.exports = (urbanize, page) => {
  const html = `
    <div>
      ${page.gallery.length > 0 ? `
        <div class="gallery">
          ${page.gallery.map((galleryItem, idx) => `
            <div style="background-image: url(${galleryItem.image.written}); display: ${idx > 2 ? 'none' : 'block'}; opacity: ${idx > 1 ? '0' : '100'};">
              <div class="color_white font_size_0_8 text_align_right" style="position: absolute; bottom: 1em; right: 1em;">${galleryItem.imageCredits || ''}</div>
            </div>
          `).join('')}
        </div>

        <script type="text/javascript">
          if(window.galleryIntervalId !== null) {
            clearInterval(window.galleryIntervalId);
            window.galleryIntervalId = null;
          }

          window.galleryIntervalId = setInterval(function() {
            const gallery = document.querySelector('.gallery');
            const galleryLabel = document.querySelector('.gallery_label');

            if(gallery) {
              let previousActive = false;
              const children = gallery.children;

              // Unhide fourth
              children[3].style.display = 'block';

              // Fade in third
              children[2].style.opacity = '1';

              // Keep second
              // ...

              // Hide first, move to end
              children[0].style.display = 'none';
              children[0].style.opacity = '0';
              gallery.appendChild(children[0]);
            } else if(window.galleryIntervalId) {
              clearInterval(window.galleryIntervalId);
              window.galleryIntervalId = null;
            }
          }, 4000);
        </script>
      ` : ''}

      <h1>
        ${page.title}
      </h1>

      ${page.text ? page.text.written : ''}

      ${scrollToTop}
    </div>
  `;

  return layout(html, urbanize, { title: page.title });
};
