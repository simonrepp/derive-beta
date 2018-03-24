module.exports = url => `
  <div class="add-this">
    <a onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}', 'facebook-share-dialog', 'width=626,height=436');"
       title="Auf Facebook teilen">
      <span class="icon-facebook"></span>
    </a>

    <a onclick="window.open('https://twitter.com/share?url=${url}', 'twitter-share-dialog','width=626,height=436');"
       title="Auf Twitter teilen">
      <span class="icon-twitter"></span>
    </a>

    <a onclick="window.print()"
       title="Seite drucken">
      <span class="icon-print"></span>
    </a>

    <a href="mailto:?subject=Urbanize Festival&body=${url}"
       title="Per Email versenden">
       <span class="icon-mail"></span>
    </a>
  </div>
`;
