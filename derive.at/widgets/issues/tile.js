const { formattedQuarter  } = require('./labeling.js');

module.exports = issue => `
  <div class="issue-tile">
    <div class="issue-tile__cover">
      <div class="issue-tile__cover-overlay">
        <div class="number">dérive N° ${issue.number}</div>
        <div class="quarter">${formattedQuarter[issue.quarter]}</div>
        <div class="title">${issue.title}</div>
        <a class="view" href="/zeitschrift/${issue.number}/">Ansehen</a>
        ${issue.shopLink ? `
          <a class="buy" href="${issue.shopLink}">Kaufen</a>
        `:''}
      </div>

      <img src="${issue.cover.written}"/>
    </div>

    <div class="issue-tile__label">
      <strong>N° ${issue.number}</strong><br/>
      ${issue.title}
    </div>
  </div>
`.trim();
