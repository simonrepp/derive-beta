module.exports = urbanize => `
  <div class="header offset">
    <a class="brand" href="/">
      ${urbanize.edition === 'wien' ?
        `<img alt="Grätzelhood - urbanize! Internationales Festival für urbane Erkundungen, 24.-28. Oktober 2018, Wien" src="/images/graetzelhood_header.png">`
        :
        `<img alt="bewegung. macht. stadt. - urbanize! Int. festival für urbane erkundungen, 5.-14. okt. 2018, berlin" src="/images/bewegung_macht_stadt_header_neu.jpg">`
      }
    </a>
  </div>
`;
