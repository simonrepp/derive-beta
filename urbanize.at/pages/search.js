const eventListing = require('../widgets/event-listing.js'),
      layout = require('./layout.js'),
      pageListing = require('../widgets/page-listing.js');

module.exports = urbanize => {
  // const query = location.pathname.split('/').pop();

  // let message = null;
  // let resultRefs = [];
  // if(query.length > 1) {
  //   const results = searchIndex.search(`${query}~1`);
  //
  //   if(results.length > 0) {
  //     resultRefs = results.map(result => result.ref);
  //   } else {
  //     message = 'Keine Resultate!';
  //   }
  // } else {
  //   message = 'Für eine Suche sind mindestens zwei Buchstaben erforderlich.';
  // }
  //
  // const eventResults = urbanize.allEventsYaml.edges.filter(({ node }) =>
  //   resultRefs.includes(`/event/${node.permalink}/`)
  // );
  //
  // const pageResults = urbanize.allPagesYaml.edges.filter(({ node }) =>
  //   resultRefs.includes(`/page/${node.permalink}/`)
  // );

  // TODO
  const html = `
    <div>
      <div class="title">
        Suchresultate für "{query}"
      </div>

      {message ? <div class="subtitle">{message}</div> : null}

      <EventListing events={eventResults.map(edge => edge.node)} />
      <PageListing pages={pageResults.map(edge => edge.node)} />
    </div>
  `;

  return layout(html, urbanize, { title: 'Suche' });
};
