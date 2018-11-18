const Turbolinks = require('turbolinks');

const initScroll = require('./scroll.js');
const initSearch = require('./search.js');
const initSidebar = require('./sidebar.js');

Turbolinks.start();

initScroll();
initSearch();
initSidebar();

window.Turbolinks = Turbolinks;
