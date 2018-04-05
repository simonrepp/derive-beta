module.exports = authors => {
  if(authors.length > 0) {
    return authors.map(author => `
      <a href="/autoren/${author.permalink}/">${author.name}</a>
    `).join(', ')
  } else {
    return '';
  }
};
