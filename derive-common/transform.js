const checkup = require('./checkup.js');
const connect = require('./connect.js');
const connectMedia = require('./connect-media.js');
const crossvalidate = require('./crossvalidate.js');
const expand = require('./expand.js');
const removeDrafts = require('./remove-drafts.js');
const source = require('./source.js');
const urbanize = require('./urbanize.js');

module.exports = async data => {
  console.time('transform');
  console.time('source');

  await source(data); // Read all source files and validate their data
                      // Documents that are not valid are not taken into the system

  console.timeEnd('source');
  console.time('connectMedia');

  connectMedia(data); // Ensure all referenced media are found
                      // Documents with invalid references are kicked out

  console.timeEnd('connectMedia');
  console.time('crossvalidate');

  crossvalidate(data); // Ensure uniqueness of primary keys before attempting to connect everything
                       // Conflicting documents are removed (the later ones)

  console.timeEnd('crossvalidate');
  console.time('connect');

  connect(data); // Create relational references between all objects (except drafts)

  console.timeEnd('connect');
  console.time('removeDrafts');

  removeDrafts(data); // Take out drafts before buiding the final dataset

  console.timeEnd('removeDrafts');
  console.time('expand');

  expand(data); // Create categories and tags, connected to their referenced objects
                // Create refined collections: authors, bookAuthors, publishers
                // Create paginated collections: booksPaginated, programsPaginated

  console.timeEnd('expand');
  console.time('urbanize');

  urbanize(data); // Create refined collections for current urbanize festival(s)

  console.timeEnd('urbanize');
  console.time('checkup');

  checkup(data); // Provide additional warnings for unused media, as well as
                 // for categories and tags with multiple spelling variants

  console.timeEnd('checkup');
  console.timeEnd('transform');

  return data;
};
