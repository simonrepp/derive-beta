const layout = require('../layout.js');

// TODO: Simple implementation for this and relink from header,
//       or alternatively remove this template as it's not needed.
//
//       Possible strategy: iframe embed of shop page, Christoph possibly
//       provides tictail access to look for embed code provided by them.

module.exports = () => {
  const html = `
    <div>
    </div>
  `;

  return layout(html, { activeSection: 'Kiosk', title: 'Kiosk' });
};
