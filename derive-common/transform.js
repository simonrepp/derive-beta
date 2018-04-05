const path = require('path'),
      shell = require('shell');

const checkup = require('./checkup.js'),
      connect = require('./connect.js'),
      connectMedia = require('./connect-media.js'),
      crossvalidate = require('./crossvalidate.js'),
      expand = require('./expand.js'),
      source = require('./source.js'),
      urbanize = require('./urbanize.js');

// TODO: Consider a "wipe" step that resets all intelligent fields that have to be wiped always (=are only optionally overwritten by processing), eg. backreferences

module.exports = async data => {
  console.time('transform');
  console.time('source');

  await source(data); // Read all source files and validate their data
                      // Documents that are not valid are not taken into the system

  console.timeEnd('source');
  console.time('connectMedia');

  await connectMedia(data); // Ensure all referenced media are found
                            // Documents with invalid references are kicked out

  console.timeEnd('connectMedia');
  console.time('crossvalidate');

  crossvalidate(data); // Ensure uniqueness of primary keys before attempting to connect everything
                       // Conflicting documents are removed (the later ones)

 console.timeEnd('crossvalidate');
 console.time('connect');

  connect(data); // Create relational references between all objects

  console.timeEnd('connect');
  console.time('expand');

  expand(data); // Create categories and tags, connected to their referenced objects
                // Create refined collections: authors, bookAuthors, publishers

  console.timeEnd('expand');
  console.time('urbanize');

  urbanize(data); // Create refined collections for current urbanize festival(s)

  console.timeEnd('urbanize');
  console.time('checkup');

  checkup(data); // Provide additional warnings for unused media

  console.timeEnd('checkup');
  console.timeEnd('transform');

  console.log(data); // TODO: Remove after all is done

  return data;
};
