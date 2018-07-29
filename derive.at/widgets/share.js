// TODO: Revisit share.js data aquisition (what to pass, how to get url (dynamically?))
// TODO: footer.js share icons are similiar to share.js icons -> clarify differences or non-differences and implement both finalized

module.exports = (title, url, options = { print: false }) => `
  <a class="a__no-underline"
     id="share-on-facebook"
     title="Auf Facebook teilen">
   <span class="icon-facebook"></span>
  </a>

  <a class="a__no-underline"
     id="share-on-twitter"
     title="Auf Twitter teilen">
    <span class="icon-twitter"></span>
  </a>

  <a class="a__no-underline"
     href="mailto:?subject=${title}&body=${url}"
     title="Per Email versenden">
    <span class="icon-mail"></span>
  </a>

  ${options.print ? `
    <a class="a__no-underline"
       href="${url}druckversion/"
       title="Seite drucken">
      <span class="icon-print"></span>
    </a>
  `:''}

  <script type="text/javascript">

    document.querySelector('#share-on-facebook')
            .addEventListener('click', function(event) {
              window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}',
                          'facebook-share-dialog',
                          'width=626,height=436');
            });

    document.querySelector('#share-on-twitter')
            .addEventListener('click', function(event) {
              window.open('https://twitter.com/share?url=${url}',
                          'twitter-share-dialog',
                          'width=626,height=436');
            });

  </script>
`;
