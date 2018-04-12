const formattedQuarter = {
  1: 'Jän - Mär',
  2: 'Apr - Juni',
  3: 'Juli - Sept',
  4: 'Okt - Dez'
};

exports.formattedQuarter = formattedQuarter;

exports.fullIssueTitle = issue => `
  <a href="/zeitschrift/${issue.number}/">
    dérive N° ${issue.number} (${formattedQuarter[issue.quarter]} / ${issue.year})
  </a>
`.trim();
