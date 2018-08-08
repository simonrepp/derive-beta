module.exports = reviews => {
  if(reviews.length > 1) {
    return `Rezensionen lesen: ${reviews.map((review, index) => `<a href="/texte/${review.permalink}/">${index + 1}</a>`).join(' ')}`;
  } else if(reviews.length === 1) {
    return `<a href="/texte/${reviews[0].permalink}/">Rezension lesen</a>`;
  } else {
    return '';
  }
};
