// TODO: Use ES6 Module syntax ?? (but be careful because you might have to require from other modules that use commonjs)

const AudioEngine = require('./audio_engine');
const Turbolinks = require('turbolinks');

const initScroll = require('./scroll.js');
const initSearch = require('./search.js');
const initSidebar = require('./sidebar.js');

Turbolinks.start();

initScroll();
initSearch();
initSidebar();

window.AudioEngine = AudioEngine;
window.Turbolinks = Turbolinks;
