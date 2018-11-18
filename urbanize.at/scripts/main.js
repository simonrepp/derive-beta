const Turbolinks = require('turbolinks');

const initSearch = require('./search.js');

Turbolinks.start();

initSearch();

window.Turbolinks = Turbolinks;
