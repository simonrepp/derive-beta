module.exports = issue => `
  <strong>${issue.quarter} / ${issue.year}</strong>

  <br/><br/>

  <a href="/zeitschrift/${issue.permalink}/">${issue.title}</a>

  <br/><br/><br/>

  <a href="${issue.shopLink}"
     target="_blank">
    Heft kaufen
  </a>
`;
