const logo = require('./logo.js');

const sections = [
  { name: 'Zeitschrift', route: '/zeitschrift/' },
  { name: 'Texte', route: '/texte/' },
  { name: 'Radio', route: '/radio/' },
  { name: 'Festival', route: '/festival/' },
  { name: 'Bücher', route: '/buecher/' },
  { name: 'Autoren', route: '/autoren/' },
  { name: 'Kiosk', route: 'https://derive.tictail.com/', tab: true }
];

module.exports = options => `
  <header class="header">
    <div class="header__elements">
      <a class="header__logo-link" href="/">
        ${logo}
      </a>

      <nav class="header__links">
        ${sections.map(section => `
          <div class="header__link__padding">
            <a class="header__link ${section.name === options.activeSection ? 'header__link--active' : ''}"
               href="${section.route}"
               ${section.tab ? 'target="_blank"' : ''} >
              ${section.name}
            </a>
          </div>
        `).join('')}
      </nav>

      <div class="header__compact-location">
        ${[
            options.activeSection ? `» ${options.activeSection}` : null,
            options.title
        ].filter(Boolean).join(' / ')}
      </div>
    </div>
  </header>
`;
