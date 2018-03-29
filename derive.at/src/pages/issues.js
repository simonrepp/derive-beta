const layout = require('../layout.js'),
      share = require('../widgets/share.js'),
      tags = require('../widgets/tags.js');

const formattedQuarter = {
  1: 'Jän - Mär',
  2: 'Apr - Juni',
  3: 'Juli - Sept',
  4: 'Okt - Dez'
};

module.exports = data => {
  const sortedDescending = Array.from(data.issues.values()).sort((a, b) => b.number - a.number);
  const latest = sortedDescending[0];

  const years = [];
  sortedDescending.forEach(issue => {
    const year = issue.year;

    if(years[year]) {
      years[year].push(issue);
    } else {
      years[year] = [issue];
    }
  });


  const html = `
    <div>
      <div class="feature">
        <div class="feature__image">
          <img src="${latest.cover.written}"/>
          Design: Jemand statischer
        </div>

        <div class="feature__text">
          <a href="#">dérive No ${latest.number} (${formattedQuarter[latest.quarter]} / ${latest.year})</a>

          <h1>
            <a href="#">
              ${latest.title}
            </a>
          </h1>

          <span>
            ${latest.description}
          </span>

          TODO Mit Beiträgen von:<br/>
          Juna Selzbach, Bernhard Kernegger, Christian Klettner, Elke Rauch, Christoph Laimer, Svetlana Boijevics

          Tags
          ${tags(latest.tags)}

          ${share(latest.title, 'https://derive.at/TODO/')}
        </div>
      </div>

      ${Object.keys(years).sort((a, b) => b - a).map(year => `
        <hr/>

        ${year}

        <div class="tiles__magazine">
          ${years[year].map(issue => `
            <div class="tile__magazine">
              <div class="tile__magazine__cover">
                <div class="desktop-overlay">
                  <div class="number">dérive N<sup>o</sup> ${issue.number}</div>
                  <div class="quarter">${formattedQuarter[issue.quarter]}</div>
                  <div class="title">${issue.title}</div>
                  <a class="view" href="/zeitschrift/${issue.number}/">Ansehen</a>
                  <a class="buy" href="/shop/TODO-where-take-the-link-from/">Kaufen</a>
                </div>

                <img src="${issue.cover.written}"/>
              </div>

              <div class="tile__magazine__label">
                <strong>N<sup>o</sup> ${issue.number}</strong><br/>
                ${issue.title}
              </div>
            </div>
          `.trim()).join('')}
        </div>
      `).join('')}

    </div>
  `;

  return layout(html, { activeSection: 'Zeitschrift', title: 'Zeitschrift' });
};
